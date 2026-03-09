"""
GVM Performance — отправка Telegram-уведомлений о ТО, документах, масле.
Принимает token пользователя и отправляет тестовое сообщение или сводку.
"""
import json
import os
import psycopg2
import urllib.request
from datetime import date, timedelta


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    }


def ok(data):
    return {'statusCode': 200, 'headers': {**cors_headers(), 'Content-Type': 'application/json'}, 'body': json.dumps(data)}


def err(msg, code=400):
    return {'statusCode': code, 'headers': {**cors_headers(), 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg})}


def send_telegram(bot_token: str, chat_id: str, text: str) -> bool:
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    payload = json.dumps({'chat_id': chat_id, 'text': text, 'parse_mode': 'HTML'}).encode()
    req = urllib.request.Request(url, data=payload, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read())
            return result.get('ok', False)
    except Exception:
        return False


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'POST')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    token = (event.get('headers') or {}).get('X-Auth-Token') or (event.get('headers') or {}).get('x-auth-token')

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("SELECT s.user_id, u.telegram_bot_token, u.telegram_chat_id FROM gvm_sessions s JOIN gvm_users u ON u.id = s.user_id WHERE s.token = %s AND s.token NOT LIKE 'revoked_%'", (token,))
        row = cur.fetchone()
        if not row:
            return err('Не авторизован', 401)
        user_id, bot_token, chat_id = row

        # POST /test
        if '/test' in path:
            tg_token = body.get('telegram_bot_token') or bot_token
            tg_chat = body.get('telegram_chat_id') or chat_id
            if not tg_token or not tg_chat:
                return err('Telegram Bot Token и Chat ID не настроены')
            text = '🚗 <b>GVM Performance</b>\n\nТестовое уведомление работает! Вы будете получать уведомления о ТО, документах и замене масла.'
            success = send_telegram(tg_token, tg_chat, text)
            if not success:
                return err('Не удалось отправить сообщение. Проверьте токен и Chat ID')
            return ok({'ok': True, 'message': 'Сообщение отправлено'})

        # POST /summary
        if '/summary' in path:
            if not bot_token or not chat_id:
                return err('Telegram не настроен')

            cur.execute('SELECT make, model, mileage FROM gvm_cars WHERE user_id = %s LIMIT 1', (user_id,))
            car = cur.fetchone()

            cur.execute("SELECT COALESCE(SUM(distance), 0) FROM gvm_trips WHERE user_id = %s AND trip_date >= date_trunc('month', CURRENT_DATE)", (user_id,))
            month_km = cur.fetchone()[0]

            cur.execute("SELECT COALESCE(SUM(amount), 0) FROM gvm_finances WHERE user_id = %s AND expense_date >= date_trunc('month', CURRENT_DATE)", (user_id,))
            month_spent = cur.fetchone()[0]

            today = date.today()
            soon = today + timedelta(days=30)
            cur.execute('SELECT doc_type, expires_date FROM gvm_documents WHERE user_id = %s AND expires_date IS NOT NULL AND expires_date <= %s ORDER BY expires_date', (user_id, soon))
            expiring_docs = cur.fetchall()

            lines = ['🚗 <b>GVM Performance — Сводка</b>\n']
            if car:
                lines.append(f'Автомобиль: {car[0]} {car[1]}, {car[2]:,} км')
            lines.append(f'Пробег за месяц: {int(month_km):,} км')
            lines.append(f'Расходы за месяц: {float(month_spent):,.0f} ₽')
            if expiring_docs:
                lines.append('\n⚠️ Истекающие документы:')
                for doc_type, exp_date in expiring_docs:
                    days_left = (exp_date - today).days
                    lines.append(f'  • {doc_type}: через {days_left} дн.')

            success = send_telegram(bot_token, chat_id, '\n'.join(lines))
            return ok({'ok': success})

        return err('Маршрут не найден', 404)
    finally:
        cur.close()
        conn.close()

"""
GVM Performance — авторизация и управление пользователями.
Регистрация, вход, выход, смена пароля, получение настроек.
"""
import json
import os
import hashlib
import secrets
import psycopg2
from datetime import datetime


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
    }


def ok(data):
    return {'statusCode': 200, 'headers': {**cors_headers(), 'Content-Type': 'application/json'}, 'body': json.dumps(data, default=str)}


def err(msg, code=400):
    return {'statusCode': code, 'headers': {**cors_headers(), 'Content-Type': 'application/json'}, 'body': json.dumps({'error': msg})}


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    token = event.get('headers', {}).get('X-Auth-Token') or event.get('headers', {}).get('x-auth-token')

    conn = get_conn()
    cur = conn.cursor()

    try:
        # POST /register
        if method == 'POST' and '/register' in path:
            username = body.get('username', '').strip().lower()
            password = body.get('password', '')
            if not username or not password:
                return err('Логин и пароль обязательны')
            if len(password) < 6:
                return err('Пароль минимум 6 символов')
            cur.execute('SELECT id FROM gvm_users WHERE username = %s', (username,))
            if cur.fetchone():
                return err('Пользователь уже существует')
            ph = hash_password(password)
            cur.execute('INSERT INTO gvm_users (username, password_hash) VALUES (%s, %s) RETURNING id', (username, ph))
            user_id = cur.fetchone()[0]
            # Создаём дефолтные интервалы
            default_intervals = [
                ('Масло двигателя', 10000, 365),
                ('Масляный фильтр', 10000, 365),
                ('Воздушный фильтр', 30000, 730),
                ('Салонный фильтр', 15000, 365),
                ('Топливный фильтр', 60000, 1095),
                ('Масло АКПП', 60000, 1095),
                ('Масло МКПП', 60000, 1095),
                ('Масло редукторов', 40000, 730),
                ('Масло раздатки', 40000, 730),
                ('Тормозная жидкость', 40000, 730),
                ('Антифриз', 80000, 1460),
                ('Свечи зажигания', 30000, 730),
                ('Ремень ГРМ', 90000, 1095),
                ('Тормозные колодки передние', 40000, 730),
                ('Тормозные колодки задние', 60000, 1095),
                ('Тормозные диски', 80000, 1460),
                ('Амортизаторы', 80000, 2190),
                ('Аккумулятор', 0, 1460),
                ('Сезонная смена шин', 0, 182),
                ('Балансировка колёс', 20000, 365),
                ('Сход-развал', 20000, 365),
            ]
            for name, km, days in default_intervals:
                cur.execute(
                    'INSERT INTO gvm_intervals (user_id, name, interval_km, interval_days) VALUES (%s, %s, %s, %s)',
                    (user_id, name, km, days)
                )
            conn.commit()
            t = secrets.token_hex(32)
            device = event.get('headers', {}).get('user-agent', '')[:200]
            cur.execute('INSERT INTO gvm_sessions (user_id, token, device_info) VALUES (%s, %s, %s)', (user_id, t, device))
            conn.commit()
            return ok({'token': t, 'user_id': user_id, 'username': username})

        # POST /login
        if method == 'POST' and '/login' in path:
            username = body.get('username', '').strip().lower()
            password = body.get('password', '')
            ph = hash_password(password)
            cur.execute('SELECT id, username FROM gvm_users WHERE username = %s AND password_hash = %s', (username, ph))
            row = cur.fetchone()
            if not row:
                return err('Неверный логин или пароль', 401)
            user_id, uname = row
            t = secrets.token_hex(32)
            device = event.get('headers', {}).get('user-agent', '')[:200]
            cur.execute('INSERT INTO gvm_sessions (user_id, token, device_info) VALUES (%s, %s, %s)', (user_id, t, device))
            conn.commit()
            return ok({'token': t, 'user_id': user_id, 'username': uname})

        # POST /logout
        if method == 'POST' and '/logout' in path:
            if token:
                cur.execute('UPDATE gvm_sessions SET last_active = NOW() WHERE token = %s', (token,))
                cur.execute('SELECT id FROM gvm_sessions WHERE token = %s', (token,))
                row = cur.fetchone()
                if row:
                    cur.execute('UPDATE gvm_sessions SET token = %s WHERE id = %s', ('revoked_' + secrets.token_hex(8), row[0]))
                conn.commit()
            return ok({'ok': True})

        # GET /me
        if method == 'GET' and '/me' in path:
            if not token:
                return err('Нет токена', 401)
            cur.execute('SELECT s.user_id, u.username, u.telegram_bot_token, u.telegram_chat_id, u.notify_oil, u.notify_docs, u.notify_filters, u.notify_idle, u.notify_summary, u.oil_warn_km, u.oil_warn_days FROM gvm_sessions s JOIN gvm_users u ON u.id = s.user_id WHERE s.token = %s AND s.token NOT LIKE \'revoked_%\'', (token,))
            row = cur.fetchone()
            if not row:
                return err('Сессия не найдена', 401)
            cur.execute('UPDATE gvm_sessions SET last_active = NOW() WHERE token = %s', (token,))
            conn.commit()
            return ok({
                'user_id': row[0], 'username': row[1],
                'telegram_bot_token': row[2], 'telegram_chat_id': row[3],
                'notify_oil': row[4], 'notify_docs': row[5],
                'notify_filters': row[6], 'notify_idle': row[7],
                'notify_summary': row[8],
                'oil_warn_km': row[9], 'oil_warn_days': row[10],
            })

        # PUT /settings
        if method == 'PUT' and '/settings' in path:
            if not token:
                return err('Нет токена', 401)
            cur.execute('SELECT user_id FROM gvm_sessions WHERE token = %s AND token NOT LIKE \'revoked_%\'', (token,))
            row = cur.fetchone()
            if not row:
                return err('Сессия не найдена', 401)
            user_id = row[0]
            fields = ['telegram_bot_token', 'telegram_chat_id', 'notify_oil', 'notify_docs', 'notify_filters', 'notify_idle', 'notify_summary', 'oil_warn_km', 'oil_warn_days']
            updates = {f: body[f] for f in fields if f in body}
            if updates:
                set_clause = ', '.join(f'{k} = %s' for k in updates)
                cur.execute(f'UPDATE gvm_users SET {set_clause} WHERE id = %s', (*updates.values(), user_id))
                conn.commit()
            return ok({'ok': True})

        # PUT /change-password
        if method == 'PUT' and '/change-password' in path:
            if not token:
                return err('Нет токена', 401)
            cur.execute('SELECT user_id FROM gvm_sessions WHERE token = %s AND token NOT LIKE \'revoked_%\'', (token,))
            row = cur.fetchone()
            if not row:
                return err('Сессия не найдена', 401)
            user_id = row[0]
            old_pass = body.get('old_password', '')
            new_pass = body.get('new_password', '')
            if len(new_pass) < 6:
                return err('Новый пароль минимум 6 символов')
            cur.execute('SELECT id FROM gvm_users WHERE id = %s AND password_hash = %s', (user_id, hash_password(old_pass)))
            if not cur.fetchone():
                return err('Неверный текущий пароль')
            cur.execute('UPDATE gvm_users SET password_hash = %s WHERE id = %s', (hash_password(new_pass), user_id))
            conn.commit()
            return ok({'ok': True})

        return err('Маршрут не найден', 404)
    finally:
        cur.close()
        conn.close()

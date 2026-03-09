"""
GVM Performance — CRUD для автомобиля, поездок, финансов, интервалов, запчастей, документов, владельцев.
Все запросы защищены токеном X-Auth-Token.
"""
import json
import os
import psycopg2
from datetime import date


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


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


def get_user_id(cur, token):
    if not token:
        return None
    cur.execute("SELECT user_id FROM gvm_sessions WHERE token = %s AND token NOT LIKE 'revoked_%'", (token,))
    row = cur.fetchone()
    return row[0] if row else None


def rows_to_dicts(cur, rows):
    cols = [d[0] for d in cur.description]
    return [dict(zip(cols, r)) for r in rows]


def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    qs = event.get('queryStringParameters') or {}
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    token = (event.get('headers') or {}).get('X-Auth-Token') or (event.get('headers') or {}).get('x-auth-token')

    conn = get_conn()
    cur = conn.cursor()

    try:
        user_id = get_user_id(cur, token)
        if not user_id:
            return err('Не авторизован', 401)

        # ── CAR ──────────────────────────────────────────────────────────
        if '/car' in path:
            if method == 'GET':
                cur.execute('SELECT * FROM gvm_cars WHERE user_id = %s ORDER BY id LIMIT 1', (user_id,))
                rows = cur.fetchall()
                if not rows:
                    return ok(None)
                return ok(rows_to_dicts(cur, rows)[0])

            if method == 'POST' or method == 'PUT':
                cur.execute('SELECT id FROM gvm_cars WHERE user_id = %s LIMIT 1', (user_id,))
                existing = cur.fetchone()
                fields = ['make', 'model', 'year', 'vin', 'plate', 'engine_volume', 'power', 'fuel_type',
                          'transmission', 'drive_type', 'mileage', 'last_oil_change_km', 'last_oil_change_date',
                          'tire_season', 'tire_size', 'battery_voltage_start', 'battery_voltage_stop', 'photo_url']
                data = {f: body[f] for f in fields if f in body}
                if existing:
                    if data:
                        set_clause = ', '.join(f'{k} = %s' for k in data)
                        cur.execute(f'UPDATE gvm_cars SET {set_clause}, updated_at = NOW() WHERE user_id = %s', (*data.values(), user_id))
                    conn.commit()
                    cur.execute('SELECT * FROM gvm_cars WHERE user_id = %s', (user_id,))
                    return ok(rows_to_dicts(cur, cur.fetchall())[0])
                else:
                    data['user_id'] = user_id
                    cols = ', '.join(data.keys())
                    placeholders = ', '.join(['%s'] * len(data))
                    cur.execute(f'INSERT INTO gvm_cars ({cols}) VALUES ({placeholders}) RETURNING *', list(data.values()))
                    conn.commit()
                    cur.execute('SELECT * FROM gvm_cars WHERE user_id = %s', (user_id,))
                    return ok(rows_to_dicts(cur, cur.fetchall())[0])

        # ── TRIPS ─────────────────────────────────────────────────────────
        if '/trips' in path:
            trip_id = None
            parts = path.rstrip('/').split('/')
            if parts[-1].isdigit():
                trip_id = int(parts[-1])

            if method == 'GET':
                if trip_id:
                    cur.execute('SELECT * FROM gvm_trips WHERE id = %s AND user_id = %s', (trip_id, user_id))
                    rows = cur.fetchall()
                    return ok(rows_to_dicts(cur, rows)[0] if rows else None)
                limit = int(qs.get('limit', 50))
                offset = int(qs.get('offset', 0))
                cur.execute('SELECT * FROM gvm_trips WHERE user_id = %s ORDER BY trip_date DESC, created_at DESC LIMIT %s OFFSET %s', (user_id, limit, offset))
                return ok(rows_to_dicts(cur, cur.fetchall()))

            if method == 'POST':
                fields = ['trip_date', 'started_at', 'ended_at', 'origin', 'destination', 'distance', 'purpose', 'battery_start', 'battery_end', 'fuel_consumption', 'aggression_index', 'notes']
                data = {f: body[f] for f in fields if f in body}
                data['user_id'] = user_id
                cols = ', '.join(data.keys())
                placeholders = ', '.join(['%s'] * len(data))
                cur.execute(f'INSERT INTO gvm_trips ({cols}) VALUES ({placeholders}) RETURNING *', list(data.values()))
                row = cur.fetchone()
                conn.commit()
                cur.execute('SELECT * FROM gvm_trips WHERE id = %s', (row[0],))
                return ok(rows_to_dicts(cur, cur.fetchall())[0])

            if method == 'PUT' and trip_id:
                fields = ['trip_date', 'started_at', 'ended_at', 'origin', 'destination', 'distance', 'purpose', 'battery_start', 'battery_end', 'fuel_consumption', 'aggression_index', 'notes']
                data = {f: body[f] for f in fields if f in body}
                if data:
                    set_clause = ', '.join(f'{k} = %s' for k in data)
                    cur.execute(f'UPDATE gvm_trips SET {set_clause} WHERE id = %s AND user_id = %s', (*data.values(), trip_id, user_id))
                    conn.commit()
                cur.execute('SELECT * FROM gvm_trips WHERE id = %s AND user_id = %s', (trip_id, user_id))
                return ok(rows_to_dicts(cur, cur.fetchall())[0])

        # ── FINANCES ──────────────────────────────────────────────────────
        if '/finances' in path:
            fin_id = None
            parts = path.rstrip('/').split('/')
            if parts[-1].isdigit():
                fin_id = int(parts[-1])

            if method == 'GET':
                limit = int(qs.get('limit', 100))
                offset = int(qs.get('offset', 0))
                cur.execute('SELECT * FROM gvm_finances WHERE user_id = %s ORDER BY expense_date DESC, created_at DESC LIMIT %s OFFSET %s', (user_id, limit, offset))
                return ok(rows_to_dicts(cur, cur.fetchall()))

            if method == 'POST':
                fields = ['category', 'subcategory', 'expense_date', 'amount', 'mileage', 'description', 'location', 'photo_url']
                data = {f: body[f] for f in fields if f in body}
                data['user_id'] = user_id
                cols = ', '.join(data.keys())
                placeholders = ', '.join(['%s'] * len(data))
                cur.execute(f'INSERT INTO gvm_finances ({cols}) VALUES ({placeholders}) RETURNING *', list(data.values()))
                row = cur.fetchone()
                conn.commit()
                cur.execute('SELECT * FROM gvm_finances WHERE id = %s', (row[0],))
                return ok(rows_to_dicts(cur, cur.fetchall())[0])

            if method == 'PUT' and fin_id:
                fields = ['category', 'subcategory', 'expense_date', 'amount', 'mileage', 'description', 'location']
                data = {f: body[f] for f in fields if f in body}
                if data:
                    set_clause = ', '.join(f'{k} = %s' for k in data)
                    cur.execute(f'UPDATE gvm_finances SET {set_clause} WHERE id = %s AND user_id = %s', (*data.values(), fin_id, user_id))
                    conn.commit()
                cur.execute('SELECT * FROM gvm_finances WHERE id = %s AND user_id = %s', (fin_id, user_id))
                return ok(rows_to_dicts(cur, cur.fetchall())[0])

        # ── INTERVALS ─────────────────────────────────────────────────────
        if '/intervals' in path:
            int_id = None
            parts = path.rstrip('/').split('/')
            if parts[-1].isdigit():
                int_id = int(parts[-1])

            if method == 'GET':
                cur.execute('SELECT * FROM gvm_intervals WHERE user_id = %s ORDER BY id', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

            if method == 'POST':
                fields = ['name', 'interval_km', 'interval_days', 'last_done_km', 'last_done_date', 'notes']
                data = {f: body[f] for f in fields if f in body}
                data['user_id'] = user_id
                cols = ', '.join(data.keys())
                placeholders = ', '.join(['%s'] * len(data))
                cur.execute(f'INSERT INTO gvm_intervals ({cols}) VALUES ({placeholders}) RETURNING id', list(data.values()))
                conn.commit()
                cur.execute('SELECT * FROM gvm_intervals WHERE user_id = %s ORDER BY id', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

            if method == 'PUT' and int_id:
                fields = ['name', 'interval_km', 'interval_days', 'last_done_km', 'last_done_date', 'notes']
                data = {f: body[f] for f in fields if f in body}
                if data:
                    set_clause = ', '.join(f'{k} = %s' for k in data)
                    cur.execute(f'UPDATE gvm_intervals SET {set_clause}, updated_at = NOW() WHERE id = %s AND user_id = %s', (*data.values(), int_id, user_id))
                    conn.commit()
                cur.execute('SELECT * FROM gvm_intervals WHERE user_id = %s ORDER BY id', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

        # ── PARTS ─────────────────────────────────────────────────────────
        if '/parts' in path:
            part_id = None
            parts = path.rstrip('/').split('/')
            if parts[-1].isdigit():
                part_id = int(parts[-1])

            if method == 'GET':
                cur.execute('SELECT * FROM gvm_parts WHERE user_id = %s ORDER BY created_at DESC', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

            if method == 'POST':
                fields = ['category', 'name', 'article', 'installed_km', 'installed_date', 'cost', 'resource_km', 'photo_url', 'notes']
                data = {f: body[f] for f in fields if f in body}
                data['user_id'] = user_id
                cols = ', '.join(data.keys())
                placeholders = ', '.join(['%s'] * len(data))
                cur.execute(f'INSERT INTO gvm_parts ({cols}) VALUES ({placeholders}) RETURNING id', list(data.values()))
                conn.commit()
                cur.execute('SELECT * FROM gvm_parts WHERE user_id = %s ORDER BY created_at DESC', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

            if method == 'PUT' and part_id:
                fields = ['category', 'name', 'article', 'installed_km', 'installed_date', 'cost', 'resource_km', 'notes']
                data = {f: body[f] for f in fields if f in body}
                if data:
                    set_clause = ', '.join(f'{k} = %s' for k in data)
                    cur.execute(f'UPDATE gvm_parts SET {set_clause} WHERE id = %s AND user_id = %s', (*data.values(), part_id, user_id))
                    conn.commit()
                cur.execute('SELECT * FROM gvm_parts WHERE user_id = %s ORDER BY created_at DESC', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

        # ── DOCUMENTS ─────────────────────────────────────────────────────
        if '/documents' in path:
            if method == 'GET':
                cur.execute('SELECT * FROM gvm_documents WHERE user_id = %s ORDER BY doc_type', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

            if method == 'POST' or method == 'PUT':
                doc_type = body.get('doc_type')
                if not doc_type:
                    return err('doc_type обязателен')
                cur.execute('SELECT id FROM gvm_documents WHERE user_id = %s AND doc_type = %s', (user_id, doc_type))
                existing = cur.fetchone()
                fields = ['series', 'number', 'issued_date', 'expires_date', 'photo_url', 'notes']
                data = {f: body[f] for f in fields if f in body}
                if existing:
                    if data:
                        set_clause = ', '.join(f'{k} = %s' for k in data)
                        cur.execute(f'UPDATE gvm_documents SET {set_clause}, updated_at = NOW() WHERE id = %s', (*data.values(), existing[0]))
                else:
                    data['doc_type'] = doc_type
                    data['user_id'] = user_id
                    cols = ', '.join(data.keys())
                    placeholders = ', '.join(['%s'] * len(data))
                    cur.execute(f'INSERT INTO gvm_documents ({cols}) VALUES ({placeholders})', list(data.values()))
                conn.commit()
                cur.execute('SELECT * FROM gvm_documents WHERE user_id = %s ORDER BY doc_type', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

        # ── OWNERS ────────────────────────────────────────────────────────
        if '/owners' in path:
            owner_id = None
            parts_path = path.rstrip('/').split('/')
            if parts_path[-1].isdigit():
                owner_id = int(parts_path[-1])

            if method == 'GET':
                cur.execute('SELECT * FROM gvm_owners WHERE user_id = %s ORDER BY owned_from DESC NULLS LAST', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

            if method == 'POST':
                fields = ['full_name', 'city', 'mileage_start', 'mileage_end', 'owned_from', 'owned_to', 'comment']
                data = {f: body[f] for f in fields if f in body}
                data['user_id'] = user_id
                cols = ', '.join(data.keys())
                placeholders = ', '.join(['%s'] * len(data))
                cur.execute(f'INSERT INTO gvm_owners ({cols}) VALUES ({placeholders}) RETURNING id', list(data.values()))
                conn.commit()
                cur.execute('SELECT * FROM gvm_owners WHERE user_id = %s ORDER BY owned_from DESC NULLS LAST', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

            if method == 'PUT' and owner_id:
                fields = ['full_name', 'city', 'mileage_start', 'mileage_end', 'owned_from', 'owned_to', 'comment']
                data = {f: body[f] for f in fields if f in body}
                if data:
                    set_clause = ', '.join(f'{k} = %s' for k in data)
                    cur.execute(f'UPDATE gvm_owners SET {set_clause} WHERE id = %s AND user_id = %s', (*data.values(), owner_id, user_id))
                    conn.commit()
                cur.execute('SELECT * FROM gvm_owners WHERE user_id = %s ORDER BY owned_from DESC NULLS LAST', (user_id,))
                return ok(rows_to_dicts(cur, cur.fetchall()))

        # ── STATS ─────────────────────────────────────────────────────────
        if '/stats' in path:
            cur.execute('SELECT COALESCE(SUM(distance), 0) FROM gvm_trips WHERE user_id = %s', (user_id,))
            total_distance = cur.fetchone()[0]

            cur.execute('SELECT COALESCE(SUM(amount), 0) FROM gvm_finances WHERE user_id = %s', (user_id,))
            total_spent = cur.fetchone()[0]

            cur.execute('SELECT COUNT(*) FROM gvm_trips WHERE user_id = %s', (user_id,))
            total_trips = cur.fetchone()[0]

            cur.execute("SELECT COALESCE(SUM(distance), 0) FROM gvm_trips WHERE user_id = %s AND trip_date >= date_trunc('month', CURRENT_DATE)", (user_id,))
            month_distance = cur.fetchone()[0]

            cur.execute("SELECT COALESCE(SUM(amount), 0) FROM gvm_finances WHERE user_id = %s AND expense_date >= date_trunc('month', CURRENT_DATE)", (user_id,))
            month_spent = cur.fetchone()[0]

            cur.execute('SELECT COALESCE(AVG(aggression_index), 0) FROM gvm_trips WHERE user_id = %s AND aggression_index > 0', (user_id,))
            avg_aggression = cur.fetchone()[0]

            cur.execute("SELECT category, COALESCE(SUM(amount), 0) as total FROM gvm_finances WHERE user_id = %s GROUP BY category ORDER BY total DESC", (user_id,))
            by_category = [{'category': r[0], 'total': float(r[1])} for r in cur.fetchall()]

            cur.execute("SELECT TO_CHAR(expense_date, 'YYYY-MM') as month, COALESCE(SUM(amount), 0) as total FROM gvm_finances WHERE user_id = %s GROUP BY month ORDER BY month DESC LIMIT 12", (user_id,))
            by_month = [{'month': r[0], 'total': float(r[1])} for r in cur.fetchall()]

            return ok({
                'total_distance': int(total_distance),
                'total_spent': float(total_spent),
                'total_trips': int(total_trips),
                'month_distance': int(month_distance),
                'month_spent': float(month_spent),
                'avg_aggression': float(avg_aggression),
                'by_category': by_category,
                'by_month': by_month,
            })

        return err('Маршрут не найден', 404)
    finally:
        cur.close()
        conn.close()

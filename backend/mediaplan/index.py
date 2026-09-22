import json
import os
import calendar
from datetime import date
import psycopg2

CAPACITY_DEFAULT = 300


def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def session_ok(event, cur):
    """Доступ по мастер-паролю или активной сессии сотрудника"""
    master = os.environ.get('ADMIN_KEY', '')
    headers = event.get('headers') or {}
    provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')
    if master and provided == master:
        return True
    token = headers.get('X-Session-Token') or headers.get('x-session-token')
    if not token:
        return False
    safe = str(token).replace("'", "''")
    cur.execute(
        "SELECT 1 FROM staff_sessions s JOIN staff st ON st.id = s.staff_id "
        f"WHERE s.token = '{safe}' AND s.revoked = FALSE "
        "AND s.expires_at > CURRENT_TIMESTAMP AND st.active = TRUE"
    )
    return cur.fetchone() is not None


def row_to_dict(r):
    secs = []
    if r[16]:
        for part in str(r[16]).split(','):
            try:
                secs.append(int(part))
            except ValueError:
                secs.append(0)
    return {
        'id': r[0], 'leadId': r[1], 'year': r[2], 'month': r[3], 'rowNo': r[4],
        'brand': r[5], 'legalEntity': r[6], 'agency': r[7],
        'paymentType': r[8], 'videoStatus': r[9], 'durationSec': r[10],
        'periodText': r[11], 'startDay': r[12], 'endDay': r[13],
        'daysCount': r[14], 'amountMonth': r[15], 'daySeconds': secs,
        'discount': float(r[17]) if r[17] is not None else 0,
        'priceTotal': r[18] or 0,
    }


SELECT_COLS = (
    "id, lead_id, plan_year, plan_month, row_no, brand, legal_entity, agency, "
    "payment_type, video_status, duration_sec, period_text, start_day, end_day, "
    "days_count, amount_month, day_seconds, discount, price_total"
)


def handler(event: dict, context) -> dict:
    """Медиаплан размещений: список по месяцам, загрузка экрана в секундах, сводка выручки"""
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key, X-Session-Token',
        'Access-Control-Max-Age': '86400',
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if not session_ok(event, cur):
        cur.close(); conn.close()
        return {'statusCode': 403, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False)}

    cur.execute("SELECT daily_capacity_sec, screen_name FROM screen_settings WHERE id = 1")
    st = cur.fetchone()
    capacity = st[0] if st else CAPACITY_DEFAULT
    screen_name = st[1] if st else ''

    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        year = int(params.get('year') or date.today().year)
        month = int(params.get('month') or date.today().month)

        cur.execute(
            f"SELECT {SELECT_COLS} FROM placements "
            f"WHERE plan_year = {year} AND plan_month = {month} "
            "ORDER BY COALESCE(row_no, 999), id"
        )
        items = [row_to_dict(r) for r in cur.fetchall()]

        days = calendar.monthrange(year, month)[1]
        load = [0] * days
        for it in items:
            for i, sec in enumerate(it['daySeconds'][:days]):
                load[i] += sec

        cur.execute(
            "SELECT DISTINCT plan_year, plan_month FROM placements ORDER BY plan_year, plan_month"
        )
        periods = [{'year': r[0], 'month': r[1]} for r in cur.fetchall()]

        cur.execute(
            "SELECT plan_year, plan_month, SUM(amount_month), COUNT(*) FROM placements "
            "GROUP BY plan_year, plan_month ORDER BY plan_year, plan_month"
        )
        plan_totals = [{'year': r[0], 'month': r[1], 'amount': int(r[2] or 0), 'count': r[3]}
                       for r in cur.fetchall()]

        cur.execute("SELECT fact_year, fact_month, amount FROM revenue_facts ORDER BY fact_year, fact_month")
        revenue = [{'year': r[0], 'month': r[1], 'amount': float(r[2])} for r in cur.fetchall()]

        cur.close()
        conn.close()
        return {
            'statusCode': 200,
            'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({
                'year': year, 'month': month, 'daysInMonth': days,
                'capacity': capacity, 'screenName': screen_name,
                'items': items, 'load': load,
                'periods': periods, 'planTotals': plan_totals, 'revenue': revenue,
            }, ensure_ascii=False),
            'isBase64Encoded': False,
        }

    if method in ('POST', 'PUT'):
        body = json.loads(event.get('body', '{}'))
        days_sec = body.get('daySeconds') or []
        sec_str = ','.join(str(int(x)) for x in days_sec)
        active = [i + 1 for i, s in enumerate(days_sec) if s and int(s) > 0]

        fields = {
            'brand': esc(str(body.get('brand') or '')[:250]),
            'legal_entity': esc(str(body.get('legalEntity') or '')[:250] or None),
            'agency': esc(str(body.get('agency') or '')[:250] or None),
            'payment_type': esc(body.get('paymentType') or 'paid'),
            'video_status': esc(body.get('videoStatus') or 'ready'),
            'duration_sec': int(body.get('durationSec') or 0),
            'period_text': esc(str(body.get('periodText') or '')[:110] or None),
            'start_day': active[0] if active else 'NULL',
            'end_day': active[-1] if active else 'NULL',
            'days_count': len(active),
            'amount_month': int(body.get('amountMonth') or 0),
            'discount': float(body.get('discount') or 0),
            'price_total': int(body.get('priceTotal') or 0),
            'day_seconds': esc(sec_str or None),
        }

        item_id = body.get('id')
        if method == 'PUT' and item_id:
            sets = ', '.join(f"{k} = {v}" for k, v in fields.items())
            cur.execute(f"UPDATE placements SET {sets} WHERE id = {int(item_id)}")
        else:
            year = int(body.get('year') or date.today().year)
            month = int(body.get('month') or date.today().month)
            lead_id = body.get('leadId')
            cols = "plan_year, plan_month, lead_id, " + ', '.join(fields.keys())
            vals = f"{year}, {month}, {int(lead_id) if lead_id else 'NULL'}, " + ', '.join(str(v) for v in fields.values())
            cur.execute(f"INSERT INTO placements ({cols}) VALUES ({vals}) RETURNING id")
            item_id = cur.fetchone()[0]

        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True, 'id': item_id}, ensure_ascii=False)}

    if method == 'DELETE':
        params = event.get('queryStringParameters') or {}
        item_id = params.get('id')
        if item_id:
            cur.execute(f"DELETE FROM placements WHERE id = {int(item_id)}")
            conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'success': True}, ensure_ascii=False)}

    cur.close()
    conn.close()
    return {'statusCode': 405, 'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False)}

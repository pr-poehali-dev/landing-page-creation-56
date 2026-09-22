import json
import os
import base64
import zlib
import calendar
from datetime import date
import psycopg2
from plan_data import PACKED

REVENUE = {
    2023: {8: 450000, 9: 972000, 10: 1159000, 11: 1555900, 12: 2182925},
    2024: {1: 1782675, 2: 1447007.14, 3: 1811056.24, 4: 1956280.6, 5: 1909695.12,
           6: 2134530.6, 7: 1992756.12, 8: 2281755.12, 9: 3169813.6, 10: 2841881.12,
           11: 2955415.6, 12: 2948645.52},
    2025: {1: 2619667.24, 2: 2258191.44, 3: 2650413, 4: 2670288, 5: 2785600.5,
           6: 2681855, 7: 2650279.5, 8: 2113588, 9: 3356725, 10: 2227048,
           11: 2063948, 12: 2380161},
}


def sync_lead(cur, lead_id):
    """Раскладывает сделку по месяцам медиаплана"""
    cur.execute(
        "SELECT name, company, status, start_date, end_date, duration, "
        "placement_amount, total_price, paid_amount "
        f"FROM leads WHERE id = {int(lead_id)}"
    )
    row = cur.fetchone()
    cur.execute(f"DELETE FROM placements WHERE lead_id = {int(lead_id)}")
    if not row:
        return 0

    name, company, status, start, end, duration, placement_amount, total_price, paid = row
    if status not in ('contract', 'payment', 'live', 'completed') or not start or not end or end < start:
        return 0

    brand = (company or name or '').strip()[:250]
    if not brand:
        return 0

    dur = int(duration or 0)
    amount_total = int(placement_amount or total_price or 0)
    days_total = (end - start).days + 1
    pay_type = 'paid' if (total_price and paid and paid >= total_price) else 'unpaid'
    period_text = f"{start.strftime('%d.%m.%Y')}-{end.strftime('%d.%m.%Y')}"

    created = 0
    cm = date(start.year, start.month, 1)
    while cm <= end:
        dim = calendar.monthrange(cm.year, cm.month)[1]
        m_end = date(cm.year, cm.month, dim)
        f = start if start > cm else cm
        t = end if end < m_end else m_end
        seg = (t - f).days + 1
        secs = [0] * dim
        for d in range(f.day, t.day + 1):
            secs[d - 1] = dur
        amount_month = round(amount_total / days_total * seg) if days_total else 0
        cur.execute(
            "INSERT INTO placements (lead_id, plan_year, plan_month, brand, legal_entity, "
            "payment_type, video_status, duration_sec, period_text, start_day, end_day, "
            "days_count, price_total, amount_month, day_seconds) VALUES ("
            f"{int(lead_id)}, {cm.year}, {cm.month}, {esc(brand)}, {esc(company)}, "
            f"'{pay_type}', 'ready', {dur}, {esc(period_text)}, {f.day}, {t.day}, {seg}, "
            f"{amount_total}, {amount_month}, {esc(','.join(str(x) for x in secs))})"
        )
        created += 1
        cm = date(cm.year + (cm.month == 12), (cm.month % 12) + 1, 1)
    return created


def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def session_ok(event):
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
    c = psycopg2.connect(os.environ['DATABASE_URL'])
    k = c.cursor()
    k.execute(
        "SELECT 1 FROM staff_sessions s JOIN staff st ON st.id = s.staff_id "
        f"WHERE s.token = '{safe}' AND s.revoked = FALSE "
        "AND s.expires_at > CURRENT_TIMESTAMP AND st.active = TRUE"
    )
    ok = k.fetchone() is not None
    k.close()
    c.close()
    return ok


def handler(event: dict, context) -> dict:
    """Разовый импорт медиаплана из Excel-файла в базу: размещения по месяцам и факт выручки прошлых лет"""
    cors = {'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key'}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}
    if not session_ok(event):
        return {'statusCode': 403, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False)}

    rows = json.loads(zlib.decompress(base64.b64decode(PACKED)).decode('utf-8'))

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    body = json.loads(event.get('body') or '{}')
    if body.get('syncLeads'):
        cur.execute(
            "SELECT id FROM leads WHERE status IN ('contract','payment','live','completed') "
            "AND start_date IS NOT NULL AND end_date IS NOT NULL"
        )
        lead_ids = [r[0] for r in cur.fetchall()]
        synced = 0
        for lid in lead_ids:
            synced += sync_lead(cur, lid)
        conn.commit()
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'syncedLeads': len(lead_ids), 'rows': synced}, ensure_ascii=False)}

    cur.execute("SELECT COUNT(*) FROM placements WHERE plan_year = 2026")
    existing = cur.fetchone()[0]
    if existing > 0:
        cur.close()
        conn.close()
        return {'statusCode': 200, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'skipped': True, 'existing': existing}, ensure_ascii=False)}

    chunk = []
    inserted = 0
    for r in rows:
        chunk.append(
            f"({r['y']},{r['m']},{r['no'] if r['no'] else 'NULL'},{esc(r['brand'])},"
            f"{esc(r['legal'])},{esc(r['ag'])},'{r['pay']}','{r['vid']}',{r['dur']},"
            f"{esc(r['per'])},{r['f'] if r['f'] else 'NULL'},{r['l'] if r['l'] else 'NULL'},"
            f"{r['d']},{r['price']},{r['disc']},{r['amt']},{esc(r['sec'])})"
        )
        if len(chunk) >= 50:
            cur.execute(
                "INSERT INTO placements (plan_year,plan_month,row_no,brand,legal_entity,agency,"
                "payment_type,video_status,duration_sec,period_text,start_day,end_day,days_count,"
                "price_total,discount,amount_month,day_seconds) VALUES " + ','.join(chunk)
            )
            inserted += len(chunk)
            chunk = []

    if chunk:
        cur.execute(
            "INSERT INTO placements (plan_year,plan_month,row_no,brand,legal_entity,agency,"
            "payment_type,video_status,duration_sec,period_text,start_day,end_day,days_count,"
            "price_total,discount,amount_month,day_seconds) VALUES " + ','.join(chunk)
        )
        inserted += len(chunk)

    rev = []
    for year, months in REVENUE.items():
        for month, amount in months.items():
            rev.append(f"({year},{month},{amount})")
    cur.execute(
        "INSERT INTO revenue_facts (fact_year, fact_month, amount) VALUES " + ','.join(rev) +
        " ON CONFLICT (fact_year, fact_month) DO UPDATE SET amount = EXCLUDED.amount"
    )

    conn.commit()
    cur.close()
    conn.close()

    return {'statusCode': 200, 'headers': {**cors, 'Content-Type': 'application/json'},
            'body': json.dumps({'inserted': inserted, 'revenue': len(rev)}, ensure_ascii=False),
            'isBase64Encoded': False}
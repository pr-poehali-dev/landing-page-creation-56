import json
import os
import psycopg2

REVENUE = {
    2023: {8: 450000, 9: 972000, 10: 1159000, 11: 1555900, 12: 2182925},
    2024: {1: 1782675, 2: 1447007.14, 3: 1811056.24, 4: 1956280.6, 5: 1909695.12,
           6: 2134530.6, 7: 1992756.12, 8: 2281755.12, 9: 3169813.6, 10: 2841881.12,
           11: 2955415.6, 12: 2948645.52},
    2025: {1: 2619667.24, 2: 2258191.44, 3: 2650413, 4: 2670288, 5: 2785600.5,
           6: 2681855, 7: 2650279.5, 8: 2113588, 9: 3356725, 10: 2227048,
           11: 2063948, 12: 2380161},
}


def esc(v):
    if v is None or v == '':
        return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def handler(event: dict, context) -> dict:
    """Разовый импорт медиаплана из Excel-файла в базу: размещения по месяцам и факт выручки прошлых лет"""
    cors = {'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key'}

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    admin_key = os.environ.get('ADMIN_KEY', '')
    headers = event.get('headers', {})
    provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')
    if admin_key and provided != admin_key:
        return {'statusCode': 403, 'headers': {**cors, 'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False)}

    here = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(here, 'data.json'), encoding='utf-8') as f:
        rows = json.load(f)

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

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

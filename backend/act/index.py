import json
import os
import io
import time
import base64
from datetime import date, datetime
import psycopg2
import boto3
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from num2words import num2words
from fonts_data import REGULAR_B64, BOLD_B64

pdfmetrics.registerFont(TTFont('OpenSans', io.BytesIO(base64.b64decode(REGULAR_B64))))
pdfmetrics.registerFont(TTFont('OpenSans-Bold', io.BytesIO(base64.b64decode(BOLD_B64))))

MONTHS_RU = ["", "января", "февраля", "марта", "апреля", "мая", "июня",
             "июля", "августа", "сентября", "октября", "ноября", "декабря"]

SCREEN_ADDRESS = 'г.Владивосток, Океанский проспект, д.16А ( ТЦ "Изумруд Plaza")'

EXECUTOR = {
    'name': 'ИП Полусмак М.Ю.',
    'full_name': 'Индивидуальный предприниматель Полусмак Михаил Юрьевич',
    'address': '690065, Приморский край, г. Владивосток, ул. Крыгина, д.86В,кв.205',
    'inn': '253697094558',
}


def plural_ru(n, forms):
    n = abs(n) % 100
    n1 = n % 10
    if 10 < n < 20:
        return forms[2]
    if 1 < n1 < 5:
        return forms[1]
    if n1 == 1:
        return forms[0]
    return forms[2]


def amount_in_words(amount):
    rub = int(amount)
    kop = round((amount - rub) * 100)
    rub_words = num2words(rub, lang='ru').capitalize()
    rub_word = plural_ru(rub, ['рубль', 'рубля', 'рублей'])
    kop_word = plural_ru(kop, ['копейка', 'копейки', 'копеек'])
    return f"{rub_words} {rub_word} {kop:02d} {kop_word}"


def fmt_money(v):
    return f"{v:,.2f}".replace(",", " ").replace(".", ",")


def build_items(lead):
    items = []
    start = lead.get('start_date')
    end = lead.get('end_date')
    video_amount = lead.get('video_amount') or 0
    placement_amount = lead.get('placement_amount')
    if placement_amount is None:
        total = lead.get('total_price') or 0
        placement_amount = max(total - video_amount, 0) if video_amount else total

    period_text = ""
    if start and end:
        period_text = f", в период с {start} по {end}"

    items.append({
        'name': f"Размещение рекламно-информационных материалов на светодиодном экране по следующему адресу: {SCREEN_ADDRESS}{period_text}",
        'unit': 'усл.',
        'qty': 1,
        'price': placement_amount,
    })

    if lead.get('need_video') and video_amount:
        items.append({
            'name': f"Изготовление видеоролика для размещения рекламно-информационных материалов на светодиодном экране по следующему адресу: {SCREEN_ADDRESS}",
            'unit': 'усл.',
            'qty': 1,
            'price': video_amount,
        })

    return items


def generate_act_pdf(act_no, act_dt, customer_name, items, contract_no=None, contract_date=None):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                             leftMargin=20 * mm, rightMargin=20 * mm,
                             topMargin=15 * mm, bottomMargin=15 * mm)

    styles = {
        'normal10': ParagraphStyle('normal10', fontName='OpenSans', fontSize=9.5, leading=13),
        'bold10': ParagraphStyle('bold10', fontName='OpenSans-Bold', fontSize=9.5, leading=13),
        'title': ParagraphStyle('title', fontName='OpenSans-Bold', fontSize=15, leading=18, alignment=1),
        'cell': ParagraphStyle('cell', fontName='OpenSans', fontSize=9, leading=11),
        'cell_center': ParagraphStyle('cell_center', fontName='OpenSans', fontSize=9, leading=11, alignment=1),
    }

    elements = []

    day = act_dt.day
    month = MONTHS_RU[act_dt.month]
    year = act_dt.year
    elements.append(Paragraph(f"АКТ № {act_no} от {day:02d} {month} {year} г.", styles['title']))
    elements.append(Paragraph("об оказании услуг", ParagraphStyle('sub', fontName='OpenSans', fontSize=10, leading=13, alignment=1)))
    elements.append(Spacer(1, 6 * mm))

    if contract_no and contract_date:
        contract_text = f" в рамках договора № {contract_no} от {contract_date}"
    elif contract_no:
        contract_text = f" в рамках договора № {contract_no}"
    else:
        contract_text = ""
    elements.append(Paragraph(
        f"Исполнитель: <b>{EXECUTOR['full_name']}, ИНН {EXECUTOR['inn']}, {EXECUTOR['address']}</b>",
        styles['normal10']
    ))
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(f"Заказчик: {customer_name}", styles['normal10']))
    elements.append(Spacer(1, 4 * mm))
    elements.append(Paragraph(
        f"Настоящий акт составлен в том, что Исполнитель оказал, а Заказчик принял следующие услуги{contract_text}:",
        styles['normal10']
    ))
    elements.append(Spacer(1, 4 * mm))

    items_data = [[
        Paragraph('№', styles['cell_center']),
        Paragraph('Наименование услуги', styles['cell']),
        Paragraph('Ед.', styles['cell_center']),
        Paragraph('Кол-во', styles['cell_center']),
        Paragraph('Цена', styles['cell_center']),
        Paragraph('Сумма', styles['cell_center']),
    ]]

    total = 0
    for i, it in enumerate(items, 1):
        sum_ = it['qty'] * it['price']
        total += sum_
        items_data.append([
            Paragraph(str(i), styles['cell_center']),
            Paragraph(it['name'], styles['cell']),
            Paragraph(it['unit'], styles['cell_center']),
            Paragraph(str(it['qty']), styles['cell_center']),
            Paragraph(fmt_money(it['price']), styles['cell_center']),
            Paragraph(fmt_money(sum_), styles['cell_center']),
        ])

    items_data.append(['', '', '', '', Paragraph('Итого:', styles['bold10']), Paragraph(fmt_money(total), styles['bold10'])])
    items_data.append(['', '', '', '', Paragraph('Без налога (НДС)', styles['bold10']), Paragraph('-', styles['bold10'])])

    col_widths = [8 * mm, 78 * mm, 12 * mm, 16 * mm, 24 * mm, 24 * mm]
    it_table = Table(items_data, colWidths=col_widths, repeatRows=1)
    n_items = len(items)
    style_cmds = [
        ('BOX', (0, 0), (-1, 0 + n_items), 0.7, colors.black),
        ('INNERGRID', (0, 0), (-1, 0 + n_items), 0.7, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.92, 0.92, 0.92)),
        ('SPAN', (0, 1 + n_items), (3, 1 + n_items)),
        ('SPAN', (0, 2 + n_items), (3, 2 + n_items)),
        ('LINEABOVE', (4, 1 + n_items), (5, 1 + n_items), 0.7, colors.black),
        ('LINEBELOW', (4, 1 + n_items), (5, 1 + n_items), 0.7, colors.black),
        ('LINEBELOW', (4, 2 + n_items), (5, 2 + n_items), 0.7, colors.black),
        ('LINEBEFORE', (4, 1 + n_items), (4, 2 + n_items), 0.7, colors.black),
        ('LINEAFTER', (5, 1 + n_items), (5, 2 + n_items), 0.7, colors.black),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]
    it_table.setStyle(TableStyle(style_cmds))
    elements.append(it_table)
    elements.append(Spacer(1, 6 * mm))

    elements.append(Paragraph(f"Всего оказано услуг {len(items)} на сумму {fmt_money(total)}", styles['normal10']))
    elements.append(Paragraph(amount_in_words(total), styles['bold10']))
    elements.append(Spacer(1, 4 * mm))
    elements.append(Paragraph(
        "Услуги оказаны полностью и в срок. Заказчик претензий по объёму, качеству и срокам оказания услуг не имеет.",
        styles['normal10']
    ))
    elements.append(Spacer(1, 14 * mm))

    sign_table = Table([
        [Paragraph("Исполнитель:", styles['bold10']), Paragraph("Заказчик:", styles['bold10'])],
        [Paragraph("_____________________ / Полусмак М.Ю.", styles['normal10']),
         Paragraph("_____________________", styles['normal10'])],
    ], colWidths=[85 * mm, 85 * mm])
    sign_table.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 0),
    ]))
    elements.append(sign_table)

    doc.build(elements)
    buf.seek(0)
    return buf.read()


def handler(event: dict, context) -> dict:
    """Формирует акт выполненных услуг в формате PDF на основе данных заявки из CRM и загружает его в файловое хранилище"""
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400'
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    admin_key = os.environ.get('ADMIN_KEY', '')
    headers = event.get('headers', {})
    provided = headers.get('X-Admin-Key') or headers.get('x-admin-key', '')

    if admin_key and provided != admin_key:
        return {
            'statusCode': 403,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    body = json.loads(event.get('body', '{}'))
    lead_id = body.get('leadId')

    if not lead_id:
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'leadId обязателен'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    cur.execute(
        "SELECT name, company, need_video, total_price, start_date, end_date, placement_amount, video_amount "
        f"FROM leads WHERE id = {int(lead_id)}"
    )
    row = cur.fetchone()

    if not row:
        cur.close()
        conn.close()
        return {
            'statusCode': 404,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Заявка не найдена'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    lead = {
        'name': row[0], 'company': row[1], 'need_video': row[2], 'total_price': row[3],
        'start_date': row[4].strftime('%d.%m.%Y') if row[4] else None,
        'end_date': row[5].strftime('%d.%m.%Y') if row[5] else None,
        'placement_amount': row[6], 'video_amount': row[7],
    }

    customer_name = lead.get('company') or lead.get('name') or ''
    if not customer_name:
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'У заявки не указан заказчик'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    items = build_items(lead)
    if not any(it['price'] for it in items):
        cur.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {**cors_headers, 'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'У заявки не заполнена стоимость услуг'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    cur.execute(
        f"SELECT doc_no, created_at FROM lead_documents WHERE lead_id = {int(lead_id)} AND doc_type = 'contract' "
        "ORDER BY created_at DESC LIMIT 1"
    )
    contract_row = cur.fetchone()
    contract_no = contract_row[0] if contract_row else None
    contract_date = contract_row[1].strftime('%d.%m.%Y') if contract_row and contract_row[1] else None
    cur.close()
    conn.close()

    act_no = body.get('actNo') or str(lead_id)
    act_date_str = body.get('actDate')
    if act_date_str:
        y, m, d = act_date_str.split('-')[:3]
        act_dt = date(int(y), int(m), int(d[:2]))
    else:
        act_dt = datetime.now().date()

    pdf_bytes = generate_act_pdf(act_no, act_dt, customer_name, items, contract_no, contract_date)

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    file_key = f"acts/act_{lead_id}_{int(time.time())}.pdf"
    s3.put_object(
        Bucket='files',
        Key=file_key,
        Body=pdf_bytes,
        ContentType='application/pdf'
    )
    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"

    act_no_esc = str(act_no).replace("'", "''")
    conn2 = psycopg2.connect(dsn)
    cur2 = conn2.cursor()
    cur2.execute(
        f"INSERT INTO lead_documents (lead_id, doc_type, file_url, doc_no) "
        f"VALUES ({int(lead_id)}, 'act', '{cdn_url}', '{act_no_esc}') RETURNING id"
    )
    doc_id = cur2.fetchone()[0]
    cur2.execute(
        f"INSERT INTO lead_events (lead_id, event_type, details) "
        f"VALUES ({int(lead_id)}, 'document', 'Акт № {act_no_esc}')"
    )
    conn2.commit()
    cur2.close()
    conn2.close()

    return {
        'statusCode': 200,
        'headers': {**cors_headers, 'Content-Type': 'application/json'},
        'body': json.dumps({'success': True, 'url': cdn_url, 'docId': doc_id}, ensure_ascii=False),
        'isBase64Encoded': False
    }
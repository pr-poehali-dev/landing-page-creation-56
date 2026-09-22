import json
import os
import smtplib
from email.message import EmailMessage
from urllib.parse import urlparse
import psycopg2
import requests

DOC_LABELS = {
    'contract': 'Договор',
    'invoice': 'Счёт на оплату',
    'act': 'Акт выполненных работ',
}

SMTP_HOSTS = {
    'yandex.ru': ('smtp.yandex.ru', 465),
    'ya.ru': ('smtp.yandex.ru', 465),
    'mail.ru': ('smtp.mail.ru', 465),
    'bk.ru': ('smtp.mail.ru', 465),
    'inbox.ru': ('smtp.mail.ru', 465),
    'list.ru': ('smtp.mail.ru', 465),
    'gmail.com': ('smtp.gmail.com', 465),
}


def detect_smtp(user):
    domain = user.split('@')[-1].lower() if '@' in user else ''
    if domain in SMTP_HOSTS:
        return SMTP_HOSTS[domain]
    host = os.environ.get('SMTP_HOST')
    if host:
        return host, int(os.environ.get('SMTP_PORT', 465))
    return f'smtp.{domain}', 465


def build_message(sender, to_email, doc_type, doc_no, client_name, file_name, file_bytes):
    label = DOC_LABELS.get(doc_type, 'Документ')
    subject = f"{label}{' № ' + doc_no if doc_no else ''} — Флэшборд"

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = to_email

    greeting = f"Здравствуйте, {client_name}!" if client_name else "Здравствуйте!"
    body = (
        f"{greeting}\n\n"
        f"Во вложении — {label.lower()}"
        f"{' № ' + doc_no if doc_no else ''}.\n\n"
        "Если возникнут вопросы, ответьте на это письмо или позвоните нам.\n\n"
        "С уважением,\n"
        "Флэшборд"
    )
    msg.set_content(body)

    subtype = 'pdf'
    maintype = 'application'
    if file_name.endswith('.docx'):
        subtype = 'vnd.openxmlformats-officedocument.wordprocessingml.document'
    elif file_name.endswith('.xlsx'):
        subtype = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    msg.add_attachment(file_bytes, maintype=maintype, subtype=subtype, filename=file_name)
    return msg


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
    """Отправляет сформированный документ клиенту на электронную почту вложением"""
    method = event.get('httpMethod', 'GET')

    cors_headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        'Access-Control-Max-Age': '86400'
    }

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers, 'body': ''}

    json_headers = {**cors_headers, 'Content-Type': 'application/json'}

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': json_headers,
            'body': json.dumps({'error': 'Метод не поддерживается'}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    if not session_ok(event):
        return {
            'statusCode': 403,
            'headers': json_headers,
            'body': json.dumps({'error': 'Доступ запрещён'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    smtp_user = os.environ.get('SMTP_USER', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    if not smtp_user or not smtp_password:
        return {
            'statusCode': 400,
            'headers': json_headers,
            'body': json.dumps({'error': 'Почта не настроена. Добавьте адрес и пароль ящика в настройках проекта.'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    body = json.loads(event.get('body', '{}'))
    doc_id = body.get('docId')
    override_email = (body.get('email') or '').strip()

    if not doc_id:
        return {
            'statusCode': 400,
            'headers': json_headers,
            'body': json.dumps({'error': 'Не указан документ'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor()
    cur.execute(
        "SELECT d.doc_type, d.file_url, d.doc_no, l.name, l.company, l.email "
        f"FROM lead_documents d JOIN leads l ON l.id = d.lead_id WHERE d.id = {int(doc_id)}"
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return {
            'statusCode': 404,
            'headers': json_headers,
            'body': json.dumps({'error': 'Документ не найден'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    doc_type, file_url, doc_no, name, company, lead_email = row
    to_email = override_email or (lead_email or '').strip()

    if not to_email or '@' not in to_email:
        return {
            'statusCode': 400,
            'headers': json_headers,
            'body': json.dumps({'error': 'У клиента не указан адрес электронной почты'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    resp = requests.get(file_url, timeout=20)
    if resp.status_code != 200:
        return {
            'statusCode': 502,
            'headers': json_headers,
            'body': json.dumps({'error': 'Не удалось получить файл документа'}, ensure_ascii=False),
            'isBase64Encoded': False
        }

    file_name = os.path.basename(urlparse(file_url).path)
    client_name = company or name or ''
    msg = build_message(smtp_user, to_email, doc_type, doc_no, client_name, file_name, resp.content)

    host, port = detect_smtp(smtp_user)
    with smtplib.SMTP_SSL(host, port, timeout=20) as server:
        server.login(smtp_user, smtp_password)
        server.send_message(msg)

    return {
        'statusCode': 200,
        'headers': json_headers,
        'body': json.dumps({'success': True, 'email': to_email}, ensure_ascii=False),
        'isBase64Encoded': False
    }

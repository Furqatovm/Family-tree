import urllib.request
import urllib.parse
import json
from datetime import datetime
from flask import Blueprint, request, jsonify

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')

TELEGRAM_BOT_TOKEN = "8868285020:AAF51ZhuwyU5U44jc1qWqem5E1CoHfFXuQE"

def send_telegram_notification(name, email, subject, message_text):
    formatted_msg = (
        f"📩 <b>Yangi Murojaat (FamilyTree Website)</b>\n\n"
        f"<b>👤 Ismi:</b> {name}\n"
        f"<b>📧 Email:</b> {email}\n"
        f"<b>📌 Mavzu:</b> {subject or 'Noma\'lum'}\n\n"
        f"<b>💬 Xabar:</b>\n{message_text}\n\n"
        f"⏱ <i>Vaqt: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</i>"
    )

    try:
        # Step 1: Query getUpdates for active recipient chat_ids
        get_updates_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
        req = urllib.request.Request(get_updates_url)
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))

        chat_ids = set()
        if data.get('ok') and isinstance(data.get('result'), list):
            for update in data['result']:
                msg = update.get('message', {})
                chat_info = msg.get('chat', {})
                if chat_info.get('id'):
                    chat_ids.add(chat_info['id'])

        # Step 2: Send message to all active chat_ids
        for chat_id in chat_ids:
            send_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
            payload = json.dumps({
                "chat_id": chat_id,
                "text": formatted_msg,
                "parse_mode": "HTML"
            }).encode('utf-8')
            
            send_req = urllib.request.Request(send_url, data=payload, headers={"Content-Type": "application/json"})
            urllib.request.urlopen(send_req, timeout=5)

        return True
    except Exception as e:
        print(f"Telegram notification exception: {e}")
        return False

@contact_bp.route('', methods=['POST'])
def send_contact_message():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    subject = data.get('subject', '').strip()
    message_text = data.get('message', '').strip()

    if not name or not email or not message_text:
        return jsonify({'error': 'Name, email, and message are required'}), 400

    send_telegram_notification(name, email, subject, message_text)

    return jsonify({
        'message': 'Contact message received and sent to Telegram Bot!',
        'status': 'success'
    }), 200

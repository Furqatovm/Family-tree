import random
import sys
import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from dotenv import load_dotenv
from app.repositories.user_repository import UserRepository

# Load .env every time so that env vars are always fresh
load_dotenv(override=True)

# In-memory store for 6-digit OTP verification codes
# Schema: { 'email@example.com': { 'code': '123456', 'expires_at': datetime } }
VERIFICATION_CODES = {}

SMTP_HOST = 'smtp.gmail.com'
SMTP_PORT = 587


def _build_email_html(code: str, email: str, expires_at: datetime) -> str:
    """Build a beautiful HTML email template for OTP verification."""
    expire_str = expires_at.strftime('%H:%M:%S')
    return f"""
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FamilyTree - Tasdiqlash Kodi</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3F6B4F 0%,#2D5038 100%);padding:36px 40px;text-align:center;">
              <div style="font-size:42px;margin-bottom:8px;">🌳</div>
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">FamilyTree</h1>
              <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">Oila Shajarasi Platformasi</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="color:#1C1917;margin:0 0 8px;font-size:20px;font-weight:700;">Elektron pochta tasdiqlash</h2>
              <p style="color:#78716C;margin:0 0 28px;font-size:15px;line-height:1.6;">
                Salom! <strong style="color:#1C1917;">{email}</strong> manziliga ro'yxatdan o'tish uchun bir martalik tasdiqlash kodi yuborildi.
              </p>

              <!-- OTP Code Box -->
              <div style="background:#F5F4F0;border:2px dashed #D6A756;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="color:#78716C;margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Tasdiqlash Kodi</p>
                <div style="font-size:48px;font-weight:800;color:#3F6B4F;letter-spacing:12px;font-family:'Courier New',monospace;">{code}</div>
                <p style="color:#A8A29E;margin:12px 0 0;font-size:12px;">Kod {expire_str} gacha amal qiladi (10 daqiqa)</p>
              </div>

              <!-- Warning -->
              <div style="background:#FFF7ED;border-left:4px solid #D6A756;border-radius:8px;padding:14px 16px;margin-bottom:24px;">
                <p style="color:#92400E;margin:0;font-size:13px;line-height:1.5;">
                  <strong>Muhim:</strong> Ushbu kodni hech kimga bermang. FamilyTree xodimlari hech qachon kodni so'ramaydi.
                </p>
              </div>

              <p style="color:#A8A29E;margin:0;font-size:13px;line-height:1.6;">
                Agar siz ro'yxatdan o'tishga urinmagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F5F4F0;padding:20px 40px;text-align:center;border-top:1px solid #E7E5E4;">
              <p style="color:#A8A29E;margin:0;font-size:12px;">
                &copy; 2026 FamilyTree &mdash; Oila Shajarasi Platformasi<br/>
                <a href="https://familytree.uz" style="color:#3F6B4F;text-decoration:none;">familytree.uz</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def _send_via_resend(api_key: str, to_email: str, subject: str, html_body: str) -> tuple[bool, str]:
    """Send email via Resend REST API (HTTPS port 443, never blocked by Render)."""
    import json
    import urllib.request
    import urllib.error

    try:
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {api_key.strip()}",
            "Content-Type": "application/json",
            "User-Agent": "FamilyTree/1.0"
        }
        # Resend default testing domain is 'onboarding@resend.dev'.
        # If user has a verified custom domain, they can set RESEND_FROM_EMAIL (e.g., info@familytree.uz).
        # Otherwise, DO NOT use @gmail.com as Resend sender or it will be rejected.
        sender = os.environ.get('RESEND_FROM_EMAIL', '').strip()
        if not sender or '@gmail.com' in sender:
            sender = 'FamilyTree <onboarding@resend.dev>'

        payload = {
            "from": sender,
            "to": [to_email],
            "subject": subject,
            "html": html_body
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=12) as response:
            if response.status in [200, 201]:
                _safe_print(f"[EMAIL] Sent via Resend API (HTTPS) to {to_email}")
                return True, ""
            return False, f"Resend API status {response.status}"
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore')
        _safe_print(f"[ERROR] Resend API error: {err_body}")
        try:
            err_json = json.loads(err_body)
            msg = err_json.get('message', err_body)
            if 'testing emails' in msg.lower() or 'verify a domain' in msg.lower():
                msg = f"Resend bepul tarifida faqat o'zingizning emailingizga yubora olasiz. Barcha emaillarga yuborish uchun resend.com/domains bo'limida domenni tasdiqlang. ({msg})"
            return False, msg
        except Exception:
            return False, f"Resend API: {err_body}"
    except Exception as e:
        return False, f"Resend API error: {e}"


def _send_via_brevo(api_key: str, to_email: str, subject: str, html_body: str) -> tuple[bool, str]:
    """Send email via Brevo REST API (HTTPS port 443, never blocked by Render)."""
    import json
    import urllib.request
    import urllib.error

    try:
        url = "https://api.brevo.com/v3/smtp/email"
        headers = {
            "api-key": api_key.strip(),
            "Content-Type": "application/json",
            "User-Agent": "FamilyTree/1.0"
        }
        sender_email = os.environ.get('MAIL_SENDER_EMAIL', '').strip() or 'muhammadyusuffurqatov91@gmail.com'
        payload = {
            "sender": {"name": "FamilyTree", "email": sender_email},
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html_body
        }
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=12) as response:
            if response.status in [200, 201, 202]:
                _safe_print(f"[EMAIL] Sent via Brevo API (HTTPS) to {to_email}")
                return True, ""
            return False, f"Brevo API status {response.status}"
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8', errors='ignore')
        _safe_print(f"[ERROR] Brevo API error: {err_body}")
        return False, f"Brevo API: {err_body}"
    except Exception as e:
        return False, f"Brevo API error: {e}"


def _send_email(to_email: str, subject: str, html_body: str) -> tuple[bool, str]:
    """
    Send email with multi-engine support:
    1. Resend REST API (HTTPS 443) if RESEND_API_KEY is present
    2. Brevo REST API (HTTPS 443) if BREVO_API_KEY is present
    3. Direct Gmail SMTP (Port 465 SSL & Port 587 STARTTLS)
    """
    import socket
    import ssl

    # 1. Check for HTTPS API keys (Fastest & 100% allowed on Render cloud free tier)
    resend_key = os.environ.get('RESEND_API_KEY', '').strip()
    if resend_key:
        ok, err = _send_via_resend(resend_key, to_email, subject, html_body)
        if ok:
            return True, ""

    brevo_key = os.environ.get('BREVO_API_KEY', '').strip()
    if brevo_key:
        ok, err = _send_via_brevo(brevo_key, to_email, subject, html_body)
        if ok:
            return True, ""

    # 2. Try SMTP
    sender = os.environ.get('MAIL_SENDER_EMAIL', '').strip() or 'muhammadyusuffurqatov91@gmail.com'
    password = os.environ.get('MAIL_APP_PASSWORD', '').strip() or 'zhtdlkzgwmtjnvgd'

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"FamilyTree <{sender}>"
    msg['To'] = to_email
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))
    msg_str = msg.as_string()

    context = ssl.create_default_context()
    errors = []

    # Strategy A: Direct SSL on Port 465
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context, timeout=8) as server:
            server.login(sender, password)
            server.sendmail(sender, to_email, msg_str)
        _safe_print(f"[EMAIL] Sent via SMTP_SSL 465 to {to_email}")
        return True, ""
    except smtplib.SMTPAuthenticationError as e:
        err = "Gmail paroli (MAIL_APP_PASSWORD) xato kiritilgan yoki 2-bosqichli tasdiqlash yoqilmagan."
        _safe_print(f"[ERROR] {err}: {e}")
        return False, err
    except Exception as e:
        errors.append(f"Port 465: {e}")

    # Strategy B: IPv4-forced SSL on Port 465
    try:
        addr_info = socket.getaddrinfo('smtp.gmail.com', 465, socket.AF_INET, socket.SOCK_STREAM)
        if addr_info:
            ipv4 = addr_info[0][4][0]
            with smtplib.SMTP_SSL(ipv4, 465, context=context, timeout=8) as server:
                server.login(sender, password)
                server.sendmail(sender, to_email, msg_str)
            _safe_print(f"[EMAIL] Sent via IPv4 SSL ({ipv4}) to {to_email}")
            return True, ""
    except smtplib.SMTPAuthenticationError as e:
        err = "Gmail paroli (MAIL_APP_PASSWORD) xato kiritilgan yoki 2-bosqichli tasdiqlash yoqilmagan."
        _safe_print(f"[ERROR] {err}: {e}")
        return False, err
    except Exception as e:
        errors.append(f"IPv4 SSL: {e}")

    # Strategy C: Port 587 with STARTTLS
    try:
        with smtplib.SMTP('smtp.gmail.com', 587, timeout=8) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(sender, password)
            server.sendmail(sender, to_email, msg_str)
        _safe_print(f"[EMAIL] Sent via STARTTLS 587 to {to_email}")
        return True, ""
    except smtplib.SMTPAuthenticationError as e:
        err = "Gmail paroli (MAIL_APP_PASSWORD) xato kiritilgan yoki 2-bosqichli tasdiqlash yoqilmagan."
        _safe_print(f"[ERROR] {err}: {e}")
        return False, err
    except Exception as e:
        errors.append(f"Port 587: {e}")

    err_combined = " ; ".join(errors)
    _safe_print(f"[ERROR] Barcha SMTP ulanish usullari xatolik berdi: {err_combined}")
    return False, f"Render bepul serverida SMTP portlari bloklangan. Resend yoki Brevo API kalitini o'rnating. ({err_combined})"


def _safe_print(*args, **kwargs):
    """Print safely on Windows CP1251 terminals."""
    try:
        print(*args, **kwargs)
    except UnicodeEncodeError:
        encoded = ' '.join(str(a).encode('ascii', errors='replace').decode('ascii') for a in args)
        print(encoded, **kwargs)


class EmailVerificationService:
    @staticmethod
    def send_code(email: str):
        email_clean = email.strip().lower()

        # 1. Check if email already exists
        existing = UserRepository.get_by_email(email_clean)
        if existing:
            raise ValueError("Ushbu email manzil allaqachon ro'yxatdan o'tgan")

        # 2. Generate random 6-digit numeric code
        code = str(random.randint(100000, 999999))
        expires_at = datetime.utcnow() + timedelta(minutes=10)

        # 3. Save to store
        VERIFICATION_CODES[email_clean] = {
            'code': code,
            'expires_at': expires_at
        }

        # 4. Try sending email via Resend/Brevo/SMTP
        subject = "FamilyTree - Elektron pochta tasdiqlash kodi"
        html = _build_email_html(code, email_clean, expires_at)
        success, error_msg = _send_email(email_clean, subject, html)

        if success:
            _safe_print(f"[EMAIL OTP] Real email sent to: {email_clean}")
            return {
                'message': f"6-xonali tasdiqlash kodi {email_clean} pochtangizga muvaffaqiyatli yuborildi. Iltimos pochtangizni tekshiring.",
                'email_sent': True,
            }
        else:
            _safe_print(f"[EMAIL OTP FALLBACK] Email sending issue ({error_msg}). Dev code provided for {email_clean}: {code}")
            return {
                'message': f"Serverdan pochtaga yuborishda tarmoq muammosi yuz berdi. Tasdiqlash kodingiz: {code}",
                'email_sent': False,
                'dev_code': code,
                'error_detail': error_msg
            }

    @staticmethod
    def verify_code(email: str, code: str) -> bool:
        email_clean = email.strip().lower()
        code_clean = str(code).strip()

        entry = VERIFICATION_CODES.get(email_clean)
        if not entry:
            return False

        if datetime.utcnow() > entry['expires_at']:
            VERIFICATION_CODES.pop(email_clean, None)
            return False

        if entry['code'] == code_clean:
            # Code is correct! Clean up and return True
            VERIFICATION_CODES.pop(email_clean, None)
            return True

        return False

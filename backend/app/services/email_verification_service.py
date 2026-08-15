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


def _send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send email via Gmail SMTP. Returns True on success, False on failure."""
    # Read fresh from env on every call (so .env changes are picked up)
    sender = os.environ.get('MAIL_SENDER_EMAIL', 'muhammadyusuffurqatov91@gmail.com')
    password = os.environ.get('MAIL_APP_PASSWORD', '')

    if not password:
        print(f"[WARNING] MAIL_APP_PASSWORD not set in .env. Email NOT sent to {to_email}.")
        return False

    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = f"FamilyTree <{sender}>"
        msg['To'] = to_email

        # Attach HTML part
        msg.attach(MIMEText(html_body, 'html', 'utf-8'))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(sender, password)
            server.sendmail(sender, to_email, msg.as_string())

        print(f"[EMAIL] OTP sent successfully to {to_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        print(f"[ERROR] Gmail authentication failed. Check MAIL_APP_PASSWORD in .env")
        return False
    except Exception as e:
        print(f"[ERROR] Failed to send email to {to_email}: {e}")
        return False


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

        # 4. Send real email via Gmail SMTP
        subject = "FamilyTree - Elektron pochta tasdiqlash kodi"
        html = _build_email_html(code, email_clean, expires_at)
        email_sent = _send_email(email_clean, subject, html)

        # 5. Always log to terminal (dev fallback)
        _safe_print(f"\n==========================================")
        _safe_print(f"[EMAIL OTP] To: {email_clean}")
        _safe_print(f"[CODE] {code}")
        _safe_print(f"[STATUS] {'Email sent' if email_sent else 'Email NOT sent - check MAIL_APP_PASSWORD in .env'}")
        _safe_print(f"==========================================\n")

        return {
            'message': f"6-xonali tasdiqlash kodi {email_clean} manziliga yuborildi",
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

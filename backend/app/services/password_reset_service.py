import random
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from app.repositories.user_repository import UserRepository
from app.extensions import db
from app.services.email_verification_service import _send_email, _build_email_html, _safe_print

load_dotenv(override=True)

# In-memory store for password reset OTP codes
# Schema: { 'email': { 'code': '123456', 'expires_at': datetime } }
RESET_CODES = {}

# Rate limiting store: { 'email': { 'count': 3, 'window_start': datetime } }
RESET_RATE_LIMIT = {}

RATE_LIMIT_MAX = 3          # max attempts
RATE_LIMIT_WINDOW = 3600    # 1 hour in seconds
CODE_EXPIRY_MINUTES = 10


def _build_reset_email_html(code: str, email: str, expires_at: datetime) -> str:
    """Build HTML email template for password reset OTP."""
    expire_str = expires_at.strftime('%H:%M:%S')
    return f"""
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8" />
  <title>FamilyTree - Parol Tiklash</title>
</head>
<body style="margin:0;padding:0;background:#F5F4F0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F4F0;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#3F6B4F 0%,#2D5038 100%);padding:36px 40px;text-align:center;">
              <div style="font-size:42px;margin-bottom:8px;">🔐</div>
              <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">FamilyTree</h1>
              <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">Parol Tiklash So'rovi</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="color:#1C1917;margin:0 0 8px;font-size:20px;font-weight:700;">Parolni tiklash kodi</h2>
              <p style="color:#78716C;margin:0 0 28px;font-size:15px;line-height:1.6;">
                <strong style="color:#1C1917;">{email}</strong> manziliga parol tiklash uchun bir martalik tasdiqlash kodi yuborildi.
              </p>
              <!-- OTP Code Box -->
              <div style="background:#F5F4F0;border:2px dashed #D6A756;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                <p style="color:#78716C;margin:0 0 12px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Tiklash Kodi</p>
                <div style="font-size:48px;font-weight:800;color:#3F6B4F;letter-spacing:12px;font-family:'Courier New',monospace;">{code}</div>
                <p style="color:#A8A29E;margin:12px 0 0;font-size:12px;">Kod {expire_str} gacha amal qiladi (10 daqiqa)</p>
              </div>
              <!-- Warning -->
              <div style="background:#FFF7ED;border-left:4px solid #D6A756;border-radius:8px;padding:14px 16px;margin-bottom:24px;">
                <p style="color:#92400E;margin:0;font-size:13px;line-height:1.5;">
                  <strong>Muhim:</strong> Ushbu kodni hech kimga bermang. Agar siz so'rov bermagan bo'lsangiz, xatni e'tiborsiz qoldiring.
                </p>
              </div>
              <p style="color:#A8A29E;margin:0;font-size:13px;line-height:1.6;">
                Parolni tiklash uchun ushbu kodni saytga kiriting va yangi parol o'rnating.
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


class PasswordResetService:
    @staticmethod
    def _check_rate_limit(email: str):
        """
        Check if user exceeded 3 requests per hour.
        Returns (allowed: bool, wait_minutes: int)
        """
        now = datetime.utcnow()
        entry = RESET_RATE_LIMIT.get(email)

        if entry:
            window_start = entry['window_start']
            elapsed = (now - window_start).total_seconds()

            if elapsed >= RATE_LIMIT_WINDOW:
                # Window expired — reset
                RESET_RATE_LIMIT[email] = {'count': 1, 'window_start': now}
                return True, 0
            elif entry['count'] >= RATE_LIMIT_MAX:
                # Still in window and exceeded limit
                wait_seconds = int(RATE_LIMIT_WINDOW - elapsed)
                wait_minutes = max(1, wait_seconds // 60)
                return False, wait_minutes
            else:
                entry['count'] += 1
                return True, 0
        else:
            RESET_RATE_LIMIT[email] = {'count': 1, 'window_start': now}
            return True, 0

    @staticmethod
    def send_reset_code(email: str):
        """Send a password reset OTP code to email."""
        email_clean = email.strip().lower()

        # Check if email exists
        user = UserRepository.get_by_email(email_clean)
        if not user:
            # Don't reveal whether email exists for security
            return {'message': 'Agar bu email ro\'yxatdan o\'tgan bo\'lsa, tiklash kodi yuborildi'}

        # Check rate limit
        allowed, wait_minutes = PasswordResetService._check_rate_limit(email_clean)
        if not allowed:
            raise ValueError(
                f"Siz juda ko'p kod so'radingiz. Iltimos {wait_minutes} daqiqadan keyin urinib ko'ring."
            )

        # Generate code
        code = str(random.randint(100000, 999999))
        expires_at = datetime.utcnow() + timedelta(minutes=CODE_EXPIRY_MINUTES)

        RESET_CODES[email_clean] = {
            'code': code,
            'expires_at': expires_at
        }

        # Send email
        subject = "FamilyTree - Parolni tiklash kodi"
        html = _build_reset_email_html(code, email_clean, expires_at)
        sent, error_msg = _send_email(email_clean, subject, html)

        if not sent:
            RESET_CODES.pop(email_clean, None)
            raise RuntimeError(error_msg)

        _safe_print(f"[RESET OTP] Real email sent to: {email_clean}")

        return {'message': f"Parol tiklash kodi {email_clean} pochtangizga yuborildi. Iltimos emailingizni tekshiring."}

    @staticmethod
    def verify_and_reset_password(email: str, code: str, new_password: str):
        """Verify OTP code and set new password."""
        email_clean = email.strip().lower()
        code_clean = str(code).strip()

        entry = RESET_CODES.get(email_clean)
        if not entry:
            raise ValueError("Tasdiqlash kodi topilmadi. Qaytadan kod so'rang.")

        if datetime.utcnow() > entry['expires_at']:
            RESET_CODES.pop(email_clean, None)
            raise ValueError("Tasdiqlash kodining muddati tugagan. Qaytadan kod so'rang.")

        if entry['code'] != code_clean:
            raise ValueError("Kod noto'g'ri. Qayta tekshiring.")

        # Code valid — set new password
        user = UserRepository.get_by_email(email_clean)
        if not user:
            raise ValueError("Foydalanuvchi topilmadi.")

        from werkzeug.security import generate_password_hash
        user.password_hash = generate_password_hash(new_password)
        db.session.commit()

        # Cleanup
        RESET_CODES.pop(email_clean, None)
        # Also clear rate limit after successful reset
        RESET_RATE_LIMIT.pop(email_clean, None)

        return {'message': 'Parol muvaffaqiyatli yangilandi! Yangi parolingiz bilan kiring.'}

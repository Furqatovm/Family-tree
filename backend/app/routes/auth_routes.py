from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.schemas.user_schema import RegisterSchema, LoginSchema, UserResponseSchema
from app.services.auth_service import AuthService
from app.services.email_verification_service import EmailVerificationService
from app.services.password_reset_service import PasswordResetService

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

register_schema = RegisterSchema()
login_schema = LoginSchema()
user_schema = UserResponseSchema()

@auth_bp.route('/send-code', methods=['POST'])
def send_code():
    data = request.get_json() or {}
    email = data.get('email')
    if not email or '@' not in email:
        return jsonify({'error': 'Yaroqli email manzil kiritilishi shart'}), 400

    try:
        res = EmailVerificationService.send_code(email)
        return jsonify(res), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 400
    except Exception as err:
        return jsonify({'error': 'Tasdiqlash kodini yuborishda xatolik', 'details': str(err)}), 500

@auth_bp.route('/verify-and-register', methods=['POST'])
def verify_and_register():
    data = request.get_json() or {}
    email = data.get('email')
    code = data.get('code')
    password = data.get('password')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    if not email or not code or not password or not first_name or not last_name:
        return jsonify({'error': 'Barcha maydonlar kiritilishi shart'}), 400

    # 1. Verify 6-digit code
    is_valid = EmailVerificationService.verify_code(email, code)
    if not is_valid:
        return jsonify({'error': '6 xonali tasdiqlash kodi noto\'g\'ri yoki muddati o\'tgan!'}), 400

    # 2. Complete registration
    try:
        result = AuthService.register(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        return jsonify(result), 201
    except ValueError as err:
        return jsonify({'error': str(err)}), 409
    except Exception as err:
        return jsonify({'error': 'Ro\'yxatdan o\'tishda xatolik yuz berdi', 'details': str(err)}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = register_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation Error', 'details': err.messages}), 400

    try:
        result = AuthService.register(
            email=data['email'],
            password=data['password'],
            first_name=data['first_name'],
            last_name=data['last_name']
        )
        return jsonify(result), 201
    except ValueError as err:
        return jsonify({'error': str(err)}), 409
    except Exception as err:
        return jsonify({'error': 'Registration failed', 'details': str(err)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = login_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation Error', 'details': err.messages}), 400

    try:
        result = AuthService.login(
            email=data['email'],
            password=data['password']
        )
        return jsonify(result), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 401
    except Exception as err:
        return jsonify({'error': 'Login failed', 'details': str(err)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = int(get_jwt_identity())
    try:
        user_dict = AuthService.get_current_user(current_user_id)
        return jsonify(user_dict), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404

@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_me():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    try:
        updated_dict = AuthService.update_profile(
            current_user_id,
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            email=data.get('email')
        )
        return jsonify(updated_dict), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 400
    except Exception as err:
        return jsonify({'error': 'Profile update failed', 'details': str(err)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'error': 'Eski va yangi parol kiritilishi shart'}), 400

    try:
        AuthService.change_password(current_user_id, old_password, new_password)
        return jsonify({'message': 'Parol muvaffaqiyatli almashtirildi'}), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 400
    except Exception as err:
        return jsonify({'error': 'Parol almashtirishda xatolik', 'details': str(err)}), 500

@auth_bp.route('/subscribe', methods=['POST'])
@jwt_required()
def subscribe():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    plan_tier = data.get('plan_tier')  # 'basic' or 'pro'

    if not plan_tier or plan_tier not in ['basic', 'pro']:
        return jsonify({'error': 'Yaroqli tarif kiritilishi shart'}), 400

    try:
        updated_dict = AuthService.update_plan(current_user_id, plan_tier)
        return jsonify({'message': 'Tarif muvaffaqiyatli xarid qilindi va faollashtirildi!', 'user': updated_dict}), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 400
    except Exception as err:
        return jsonify({'error': 'Tarifni yangilashda xatolik', 'details': str(err)}), 500


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Step 1: Send OTP code to user's email for password reset."""
    data = request.get_json() or {}
    email = data.get('email', '').strip()

    if not email or '@' not in email:
        return jsonify({'error': 'Yaroqli email manzil kiritilishi shart'}), 400

    try:
        result = PasswordResetService.send_reset_code(email)
        return jsonify(result), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 429
    except Exception as err:
        return jsonify({'error': 'Tiklash kodini yuborishda xatolik', 'details': str(err)}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Step 2: Verify OTP and set new password."""
    data = request.get_json() or {}
    email = data.get('email', '').strip()
    code = data.get('code', '').strip()
    new_password = data.get('new_password', '').strip()

    if not email or not code or not new_password:
        return jsonify({'error': 'Email, kod va yangi parol kiritilishi shart'}), 400

    if len(new_password) < 6:
        return jsonify({'error': 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak'}), 400

    try:
        result = PasswordResetService.verify_and_reset_password(email, code, new_password)
        return jsonify(result), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 400
    except Exception as err:
        return jsonify({'error': 'Parolni tiklashda xatolik', 'details': str(err)}), 500

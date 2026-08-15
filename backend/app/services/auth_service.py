from flask_jwt_extended import create_access_token
from app.repositories.user_repository import UserRepository

class AuthService:
    @staticmethod
    def register(email, password, first_name, last_name):
        existing = UserRepository.get_by_email(email)
        if existing:
            raise ValueError("Email address is already registered")

        user = UserRepository.create(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        token = create_access_token(identity=str(user.id))
        return {
            'user': user.to_dict(),
            'access_token': token
        }

    @staticmethod
    def get_current_user(user_id):
        user = UserRepository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        return user.to_dict()

    @staticmethod
    def login(email, password):
        user = UserRepository.get_by_email(email)
        if not user or not user.check_password(password):
            raise ValueError("Invalid email or password")

        token = create_access_token(identity=str(user.id))
        return {
            'user': user.to_dict(),
            'access_token': token
        }

    @staticmethod
    def update_profile(user_id, **kwargs):
        user = UserRepository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        email = kwargs.get('email')
        if email and email.lower() != user.email:
            existing = UserRepository.get_by_email(email)
            if existing:
                raise ValueError("Email is already taken by another account")
        
        updated_user = UserRepository.update(user, **kwargs)
        return updated_user.to_dict()

    @staticmethod
    def change_password(user_id, old_password, new_password):
        user = UserRepository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        if not user.check_password(old_password):
            raise ValueError("Eski parol noto'g'ri kiritildi")
        
        UserRepository.update(user, password=new_password)
        return True

    @staticmethod
    def update_plan(user_id, plan_tier):
        user = UserRepository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        if plan_tier not in ['free', 'basic', 'pro']:
            raise ValueError("Noto'g'ri tarif kiritildi")
        
        UserRepository.update(user, plan_tier=plan_tier)
        return user.to_dict()

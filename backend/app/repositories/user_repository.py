from app.extensions import db
from app.models.user import User

class UserRepository:
    @staticmethod
    def get_by_id(user_id):
        return User.query.get(user_id)

    @staticmethod
    def get_by_email(email):
        return User.query.filter_by(email=email.lower()).first()

    @staticmethod
    def create(email, password, first_name, last_name):
        user = User(
            email=email.lower(),
            first_name=first_name,
            last_name=last_name,
            plan_tier='free'
        )
        user.set_password(password)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def update(user, **kwargs):
        for key, value in kwargs.items():
            if hasattr(user, key):
                if key == 'password' and value:
                    user.set_password(value)
                elif key == 'email' and value:
                    setattr(user, 'email', value.lower())
                elif key == 'avatar_url':
                    setattr(user, 'avatar_url', value if value else None)
                elif value is not None:
                    setattr(user, key, value)
        db.session.commit()
        return user

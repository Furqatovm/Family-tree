from datetime import datetime
from app.extensions import db

class Person(db.Model):
    __tablename__ = 'people'

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey('families.id', ondelete='CASCADE'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50), nullable=True)
    last_name = db.Column(db.String(50), nullable=False)
    gender = db.Column(db.String(20), nullable=False, default='other') # 'male', 'female', 'other'
    date_of_birth = db.Column(db.String(20), nullable=True) # ISO string or year
    date_of_death = db.Column(db.String(20), nullable=True)
    birthplace = db.Column(db.String(100), nullable=True)
    occupation = db.Column(db.String(100), nullable=True)
    biography = db.Column(db.Text, nullable=True)
    photo_url = db.Column(db.String(255), nullable=True)
    current_lat = db.Column(db.Float, nullable=True)
    current_lng = db.Column(db.Float, nullable=True)
    current_location_name = db.Column(db.String(150), nullable=True)
    status_message = db.Column(db.String(255), nullable=True)
    last_location_update = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'family_id': self.family_id,
            'first_name': self.first_name,
            'middle_name': self.middle_name,
            'last_name': self.last_name,
            'gender': self.gender,
            'date_of_birth': self.date_of_birth,
            'date_of_death': self.date_of_death,
            'birthplace': self.birthplace,
            'occupation': self.occupation,
            'biography': self.biography,
            'photo_url': self.photo_url,
            'current_lat': self.current_lat,
            'current_lng': self.current_lng,
            'current_location_name': self.current_location_name,
            'status_message': self.status_message,
            'last_location_update': self.last_location_update.isoformat() if self.last_location_update else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

from datetime import datetime
from app.extensions import db

class LocationHistory(db.Model):
    __tablename__ = 'location_history'

    id = db.Column(db.Integer, primary_key=True)
    person_id = db.Column(db.Integer, db.ForeignKey('people.id', ondelete='CASCADE'), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    location_name = db.Column(db.String(150), nullable=True)
    status_message = db.Column(db.String(255), nullable=True)
    recorded_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    person = db.relationship('Person', backref=db.backref('location_history', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'person_id': self.person_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'location_name': self.location_name,
            'status_message': self.status_message,
            'recorded_at': self.recorded_at.isoformat() if self.recorded_at else None
        }

from datetime import datetime
from app.extensions import db

class Relationship(db.Model):
    __tablename__ = 'relationships'

    id = db.Column(db.Integer, primary_key=True)
    family_id = db.Column(db.Integer, db.ForeignKey('families.id', ondelete='CASCADE'), nullable=False)
    person_1_id = db.Column(db.Integer, db.ForeignKey('people.id', ondelete='CASCADE'), nullable=False)
    person_2_id = db.Column(db.Integer, db.ForeignKey('people.id', ondelete='CASCADE'), nullable=False)
    relationship_type = db.Column(db.String(20), nullable=False) # 'parent' or 'spouse'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    person_1 = db.relationship('Person', foreign_keys=[person_1_id])
    person_2 = db.relationship('Person', foreign_keys=[person_2_id])

    def to_dict(self):
        return {
            'id': self.id,
            'family_id': self.family_id,
            'person_1_id': self.person_1_id,
            'person_2_id': self.person_2_id,
            'relationship_type': self.relationship_type,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

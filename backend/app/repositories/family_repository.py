from app.extensions import db
from app.models.family import Family
from app.models.person import Person
from app.models.relationship import Relationship

class FamilyRepository:
    @staticmethod
    def get_by_id(family_id):
        return Family.query.get(family_id)

    @staticmethod
    def get_all_by_owner(owner_id):
        return Family.query.filter_by(owner_id=owner_id).order_by(Family.created_at.desc()).all()

    @staticmethod
    def create(name, description, owner_id):
        family = Family(
            name=name,
            description=description,
            owner_id=owner_id
        )
        db.session.add(family)
        db.session.commit()
        return family

    @staticmethod
    def update(family, name=None, description=None):
        if name is not None:
            family.name = name
        if description is not None:
            family.description = description
        db.session.commit()
        return family

    @staticmethod
    def delete(family):
        db.session.delete(family)
        db.session.commit()

    @staticmethod
    def get_stats_for_user(owner_id):
        families = Family.query.filter_by(owner_id=owner_id).all()
        family_ids = [f.id for f in families]
        if not family_ids:
            return {
                'total_families': 0,
                'total_members': 0,
                'total_relationships': 0
            }
        
        total_members = Person.query.filter(Person.family_id.in_(family_ids)).count()
        total_relationships = Relationship.query.filter(Relationship.family_id.in_(family_ids)).count()
        
        return {
            'total_families': len(families),
            'total_members': total_members,
            'total_relationships': total_relationships
        }

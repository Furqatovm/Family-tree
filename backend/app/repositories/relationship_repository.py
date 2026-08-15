from app.extensions import db
from app.models.relationship import Relationship

class RelationshipRepository:
    @staticmethod
    def get_by_id(relationship_id):
        return Relationship.query.get(relationship_id)

    @staticmethod
    def get_all_by_family(family_id):
        return Relationship.query.filter_by(family_id=family_id).all()

    @staticmethod
    def find_existing(family_id, person_1_id, person_2_id, relationship_type):
        if relationship_type in ['spouse', 'sibling', 'relative']:
            # Symmetric relationships (p1-p2 or p2-p1)
            return Relationship.query.filter(
                Relationship.family_id == family_id,
                Relationship.relationship_type == relationship_type,
                (
                    ((Relationship.person_1_id == person_1_id) & (Relationship.person_2_id == person_2_id)) |
                    ((Relationship.person_1_id == person_2_id) & (Relationship.person_2_id == person_1_id))
                )
            ).first()
        else:
            # Asymmetric relationships (parent, child, grandparent, grandchild)
            return Relationship.query.filter_by(
                family_id=family_id,
                person_1_id=person_1_id,
                person_2_id=person_2_id,
                relationship_type=relationship_type
            ).first()

    @staticmethod
    def create(family_id, person_1_id, person_2_id, relationship_type):
        rel = Relationship(
            family_id=family_id,
            person_1_id=person_1_id,
            person_2_id=person_2_id,
            relationship_type=relationship_type
        )
        db.session.add(rel)
        db.session.commit()
        return rel

    @staticmethod
    def delete(relationship):
        db.session.delete(relationship)
        db.session.commit()

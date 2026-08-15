from app.repositories.relationship_repository import RelationshipRepository
from app.repositories.person_repository import PersonRepository
from app.repositories.family_repository import FamilyRepository

class RelationshipService:
    @staticmethod
    def get_relationships_by_family(family_id, user_id):
        family = FamilyRepository.get_by_id(family_id)
        if not family:
            raise ValueError("Family tree not found")
        if family.owner_id != user_id:
            raise PermissionError("Access denied")
        relationships = RelationshipRepository.get_all_by_family(family_id)
        return [r.to_dict() for r in relationships]

    @staticmethod
    def create_relationship(family_id, data, user_id):
        family = FamilyRepository.get_by_id(family_id)
        if not family:
            raise ValueError("Family tree not found")
        if family.owner_id != user_id:
            raise PermissionError("Access denied")

        person_1_id = data['person_1_id']
        person_2_id = data['person_2_id']
        relationship_type = data['relationship_type']

        if person_1_id == person_2_id:
            raise ValueError("A person cannot have a relationship with themselves")

        p1 = PersonRepository.get_by_id(person_1_id)
        p2 = PersonRepository.get_by_id(person_2_id)

        if not p1 or p1.family_id != family_id:
            raise ValueError("Person 1 is invalid or not in this family")
        if not p2 or p2.family_id != family_id:
            raise ValueError("Person 2 is invalid or not in this family")

        # Check existing relationship
        existing = RelationshipRepository.find_existing(family_id, person_1_id, person_2_id, relationship_type)
        if existing:
            raise ValueError("This relationship already exists")

        # Cycle prevention for parent-child relationship:
        # If person_1 is proposed parent of person_2, ensure person_1 is NOT already a descendant of person_2
        if relationship_type == 'parent':
            if RelationshipService._is_descendant(family_id, possible_descendant_id=person_1_id, possible_ancestor_id=person_2_id):
                raise ValueError("Invalid relationship: adding this parent relationship creates a cycle in the family tree")

        rel = RelationshipRepository.create(
            family_id=family_id,
            person_1_id=person_1_id,
            person_2_id=person_2_id,
            relationship_type=relationship_type
        )
        return rel.to_dict()

    @staticmethod
    def delete_relationship(relationship_id, user_id):
        rel = RelationshipRepository.get_by_id(relationship_id)
        if not rel:
            raise ValueError("Relationship not found")
        family = FamilyRepository.get_by_id(rel.family_id)
        if not family or family.owner_id != user_id:
            raise PermissionError("Access denied")
        RelationshipRepository.delete(rel)

    @staticmethod
    def _is_descendant(family_id, possible_descendant_id, possible_ancestor_id):
        """Returns True if possible_descendant_id is indeed a descendant of possible_ancestor_id."""
        relationships = RelationshipRepository.get_all_by_family(family_id)
        # Build parent -> children map
        parent_map = {}
        for r in relationships:
            if r.relationship_type == 'parent':
                parent_map.setdefault(r.person_1_id, []).append(r.person_2_id)

        # BFS from possible_ancestor_id to see if we can reach possible_descendant_id
        queue = [possible_ancestor_id]
        visited = set()

        while queue:
            curr = queue.pop(0)
            if curr == possible_descendant_id:
                return True
            if curr in visited:
                continue
            visited.add(curr)
            queue.extend(parent_map.get(curr, []))

        return False

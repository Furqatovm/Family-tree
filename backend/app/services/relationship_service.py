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
            raise ValueError("Bir shaxs o'zi bilan munosabat o'rnata olmaydi")

        p1 = PersonRepository.get_by_id(person_1_id)
        p2 = PersonRepository.get_by_id(person_2_id)

        if not p1 or p1.family_id != family_id:
            raise ValueError("1-shaxs topilmadi yoki bu oilaga tegishli emas")
        if not p2 or p2.family_id != family_id:
            raise ValueError("2-shaxs topilmadi yoki bu oilaga tegishli emas")

        # Normalize 'child' to standard 'parent' representation (person_2 is parent of person_1)
        if relationship_type == 'child':
            person_1_id, person_2_id = person_2_id, person_1_id
            relationship_type = 'parent'

        # Check existing relationship
        existing = RelationshipRepository.find_existing(family_id, person_1_id, person_2_id, relationship_type)
        if not existing and relationship_type in ['spouse', 'sibling', 'relative']:
            existing = RelationshipRepository.find_existing(family_id, person_2_id, person_1_id, relationship_type)

        if existing:
            raise ValueError("Ushbu qarindoshlik rishtasi allaqachon mavjud")

        # Cycle prevention for parent-child relationship
        if relationship_type == 'parent':
            if RelationshipService._is_descendant(family_id, possible_descendant_id=person_1_id, possible_ancestor_id=person_2_id):
                raise ValueError("Xatolik: ushbu ota-ona munosabati shajarada aylanma (cycle) hosil qiladi")

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

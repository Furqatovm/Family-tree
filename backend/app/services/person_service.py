from app.repositories.person_repository import PersonRepository
from app.repositories.family_repository import FamilyRepository

class PersonService:
    @staticmethod
    def get_people_by_family(family_id, user_id):
        family = FamilyRepository.get_by_id(family_id)
        if not family:
            raise ValueError("Family tree not found")
        if family.owner_id != user_id:
            raise PermissionError("Access denied")
        people = PersonRepository.get_all_by_family(family_id)
        return [p.to_dict() for p in people]

    @staticmethod
    def get_person_by_id(person_id, user_id):
        person = PersonRepository.get_by_id(person_id)
        if not person:
            raise ValueError("Person not found")
        family = FamilyRepository.get_by_id(person.family_id)
        if not family or family.owner_id != user_id:
            raise PermissionError("Access denied")
        return person

    @staticmethod
    def create_person(family_id, data, user_id):
        family = FamilyRepository.get_by_id(family_id)
        if not family:
            raise ValueError("Family tree not found")
        if family.owner_id != user_id:
            raise PermissionError("Access denied")

        from app.repositories.user_repository import UserRepository
        owner = UserRepository.get_by_id(family.owner_id)
        plan = 'pro' if owner.is_admin else (owner.plan_tier or 'free')
        
        current_people_count = len(PersonRepository.get_all_by_family(family_id))
        
        if plan == 'free' and current_people_count >= 10:
            raise ValueError("MEMBER_LIMIT_FREE: Bepul tarifda 1 ta shajaratga ko'pi bilan 10 ta odam qo'shish mumkin. 30 ta odam qo'shish uchun $1.99 (Basic) yoki cheksiz odamlar uchun $3.99 (PRO) tarifga o'ting!")
        elif plan == 'basic' and current_people_count >= 30:
            raise ValueError("MEMBER_LIMIT_BASIC: Basic ($1.99) tarifida ko'pi bilan 30 ta odam qo'shish mumkin. Cheksiz odamlar qo'shish uchun $3.99 (PRO) tarifga o'ting!")

        person = PersonRepository.create(
            family_id=family_id,
            first_name=data['first_name'],
            middle_name=data.get('middle_name'),
            last_name=data['last_name'],
            gender=data['gender'],
            date_of_birth=data.get('date_of_birth'),
            date_of_death=data.get('date_of_death'),
            birthplace=data.get('birthplace'),
            occupation=data.get('occupation'),
            biography=data.get('biography'),
            photo_url=data.get('photo_url'),
            current_lat=data.get('current_lat'),
            current_lng=data.get('current_lng'),
            current_location_name=data.get('current_location_name'),
            status_message=data.get('status_message')
        )
        return person.to_dict()

    @staticmethod
    def update_person_location(person_id, lat, lng, location_name, status_message, user_id):
        person = PersonRepository.get_by_id(person_id)
        if not person:
            raise ValueError("Person not found")
        family = FamilyRepository.get_by_id(person.family_id)
        if not family or family.owner_id != user_id:
            raise PermissionError("Access denied")

        updated = PersonRepository.update_location(person, lat, lng, location_name, status_message)
        return updated.to_dict()

    @staticmethod
    def get_person_location_history(person_id, user_id):
        person = PersonRepository.get_by_id(person_id)
        if not person:
            raise ValueError("Person not found")
        family = FamilyRepository.get_by_id(person.family_id)
        if not family or family.owner_id != user_id:
            raise PermissionError("Access denied")

        history = PersonRepository.get_location_history(person_id)
        return [h.to_dict() for h in history]

    @staticmethod
    def update_person(person_id, data, user_id):
        person = PersonRepository.get_by_id(person_id)
        if not person:
            raise ValueError("Person not found")
        family = FamilyRepository.get_by_id(person.family_id)
        if not family or family.owner_id != user_id:
            raise PermissionError("Access denied")

        updated = PersonRepository.update(person, data)
        return updated.to_dict()

    @staticmethod
    def delete_person(person_id, user_id):
        person = PersonRepository.get_by_id(person_id)
        if not person:
            raise ValueError("Person not found")
        family = FamilyRepository.get_by_id(person.family_id)
        if not family or family.owner_id != user_id:
            raise PermissionError("Access denied")

        PersonRepository.delete(person)

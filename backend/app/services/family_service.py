from app.repositories.family_repository import FamilyRepository

class FamilyService:
    @staticmethod
    def get_user_families(owner_id):
        families = FamilyRepository.get_all_by_owner(owner_id)
        return [f.to_dict(include_counts=True) for f in families]

    @staticmethod
    def get_family_by_id(family_id, owner_id):
        family = FamilyRepository.get_by_id(family_id)
        if not family:
            raise ValueError("Family tree not found")
        if family.owner_id != owner_id:
            raise PermissionError("Access denied")
        return family.to_dict(include_counts=True)

    @staticmethod
    def create_family(name, description, owner_id):
        from app.repositories.user_repository import UserRepository
        user = UserRepository.get_by_id(owner_id)
        plan = 'pro' if user.is_admin else (user.plan_tier or 'free')
        
        existing_count = len(FamilyRepository.get_all_by_owner(owner_id))
        
        if plan == 'free' and existing_count >= 1:
            raise ValueError("PLAN_LIMIT_FREE: Bepul tarifda faqat 1 ta shajara yaratish mumkin! Yana shajaralar yaratish uchun $1.99 (Basic) yoki $3.99 (PRO) tarifga o'ting.")
        elif plan == 'basic' and existing_count >= 2:
            raise ValueError("PLAN_LIMIT_BASIC: Basic ($1.99) tarifida maksimal 2 ta shajara yaratish mumkin! Cheksiz shajaralar uchun $3.99 (PRO) tarifga o'ting.")
        
        family = FamilyRepository.create(name=name, description=description, owner_id=owner_id)
        return family.to_dict(include_counts=True)

    @staticmethod
    def update_family(family_id, data, owner_id):
        family = FamilyRepository.get_by_id(family_id)
        if not family:
            raise ValueError("Family tree not found")
        if family.owner_id != owner_id:
            raise PermissionError("Access denied")
        updated = FamilyRepository.update(family, name=data.get('name'), description=data.get('description'))
        return updated.to_dict(include_counts=True)

    @staticmethod
    def delete_family(family_id, owner_id):
        family = FamilyRepository.get_by_id(family_id)
        if not family:
            raise ValueError("Family tree not found")
        if family.owner_id != owner_id:
            raise PermissionError("Access denied")
        FamilyRepository.delete(family)

    @staticmethod
    def get_dashboard_stats(owner_id):
        return FamilyRepository.get_stats_for_user(owner_id)

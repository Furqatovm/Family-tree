from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.user import User
from app.models.family import Family
from app.models.person import Person
from app.models.relationship import Relationship

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def verify_admin(user_id):
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return False
    return True

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    current_user_id = int(get_jwt_identity())
    if not verify_admin(current_user_id):
        return jsonify({'error': 'Faqat Admin ushbu bo\'limga kira oladi'}), 403

    total_users = User.query.count()
    total_families = Family.query.count()
    total_people = Person.query.count()
    total_relationships = Relationship.query.count()

    return jsonify({
        'total_users': total_users,
        'total_families': total_families,
        'total_people': total_people,
        'total_relationships': total_relationships
    }), 200

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    current_user_id = int(get_jwt_identity())
    if not verify_admin(current_user_id):
        return jsonify({'error': 'Faqat Admin ushbu bo\'limga kira oladi'}), 403

    users = User.query.all()
    user_list = []
    for u in users:
        u_dict = u.to_dict()
        u_dict['families_count'] = u.families.count()
        user_list.append(u_dict)

    return jsonify(user_list), 200

@admin_bp.route('/users/<int:user_id>/toggle-admin', methods=['PUT'])
@jwt_required()
def toggle_admin(user_id):
    current_user_id = int(get_jwt_identity())
    if not verify_admin(current_user_id):
        return jsonify({'error': 'Faqat Admin ushbu bo\'limga kira oladi'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404

    user.is_admin = not user.is_admin
    db.session.commit()

    return jsonify({
        'message': f'{user.first_name} admin maqomi o\'zgartirildi',
        'is_admin': user.is_admin
    }), 200

@admin_bp.route('/users/<int:user_id>/plan', methods=['PUT'])
@jwt_required()
def set_user_plan(user_id):
    current_user_id = int(get_jwt_identity())
    if not verify_admin(current_user_id):
        return jsonify({'error': 'Faqat Admin ushbu bo\'limga kira oladi'}), 403

    data = request.get_json() or {}
    plan_tier = data.get('plan_tier', 'free').lower().strip()
    if plan_tier not in ['free', 'basic', 'pro']:
        return jsonify({'error': 'Yaroqsiz tarif turi. Ruxsat berilgan: free, basic, pro'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404

    user.plan_tier = plan_tier
    db.session.commit()

    return jsonify({
        'message': f"{user.first_name} tarifi '{plan_tier.upper()}' ga o'zgartirildi",
        'user': user.to_dict()
    }), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user_id = int(get_jwt_identity())
    if not verify_admin(current_user_id):
        return jsonify({'error': 'Faqat Admin ushbu bo\'limga kira oladi'}), 403

    if current_user_id == user_id:
        return jsonify({'error': 'O\'z hisobingizni o\'chira olmaysiz'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Foydalanuvchi topilmadi'}), 404

    from app.models.family import Family
    from app.models.person import Person
    from app.models.relationship import Relationship
    from app.models.location_history import LocationHistory

    families = Family.query.filter_by(owner_id=user.id).all()
    for fam in families:
        people = Person.query.filter_by(family_id=fam.id).all()
        for p in people:
            LocationHistory.query.filter_by(person_id=p.id).delete()
            Relationship.query.filter((Relationship.person_1_id == p.id) | (Relationship.person_2_id == p.id)).delete()
            db.session.delete(p)
        Relationship.query.filter_by(family_id=fam.id).delete()
        db.session.delete(fam)

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': 'Foydalanuvchi va unga tegishli barcha shajaralar muvaffaqiyatli o\'chirildi'}), 200

@admin_bp.route('/families', methods=['GET'])
@jwt_required()
def get_families():
    current_user_id = int(get_jwt_identity())
    if not verify_admin(current_user_id):
        return jsonify({'error': 'Faqat Admin ushbu bo\'limga kira oladi'}), 403

    families = Family.query.all()
    fam_list = []
    for f in families:
        f_dict = f.to_dict()
        owner = User.query.get(f.owner_id)
        f_dict['owner_name'] = f"{owner.first_name} {owner.last_name}" if owner else "Unknown"
        f_dict['owner_email'] = owner.email if owner else ""
        f_dict['members_count'] = Person.query.filter_by(family_id=f.id).count()
        fam_list.append(f_dict)

    return jsonify(fam_list), 200

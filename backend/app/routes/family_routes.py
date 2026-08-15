from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.schemas.family_schema import FamilyCreateSchema, FamilyUpdateSchema
from app.services.family_service import FamilyService

family_bp = Blueprint('family', __name__, url_prefix='/api')

create_schema = FamilyCreateSchema()
update_schema = FamilyUpdateSchema()

@family_bp.route('/families', methods=['GET'])
@jwt_required()
def get_families():
    user_id = int(get_jwt_identity())
    families = FamilyService.get_user_families(user_id)
    return jsonify(families), 200

@family_bp.route('/families', methods=['POST'])
@jwt_required()
def create_family():
    user_id = int(get_jwt_identity())
    try:
        data = create_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation Error', 'details': err.messages}), 400

    family = FamilyService.create_family(
        name=data['name'],
        description=data.get('description'),
        owner_id=user_id
    )
    return jsonify(family), 201

@family_bp.route('/families/<int:family_id>', methods=['GET'])
@jwt_required()
def get_family(family_id):
    user_id = int(get_jwt_identity())
    try:
        family = FamilyService.get_family_by_id(family_id, user_id)
        return jsonify(family), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

@family_bp.route('/families/<int:family_id>', methods=['PUT'])
@jwt_required()
def update_family(family_id):
    user_id = int(get_jwt_identity())
    try:
        data = update_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation Error', 'details': err.messages}), 400

    try:
        updated = FamilyService.update_family(family_id, data, user_id)
        return jsonify(updated), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

@family_bp.route('/families/<int:family_id>', methods=['DELETE'])
@jwt_required()
def delete_family(family_id):
    user_id = int(get_jwt_identity())
    try:
        FamilyService.delete_family(family_id, user_id)
        return jsonify({'message': 'Family deleted successfully'}), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

@family_bp.route('/dashboard/stats', methods=['GET'])
@jwt_required()
def get_stats():
    user_id = int(get_jwt_identity())
    stats = FamilyService.get_dashboard_stats(user_id)
    return jsonify(stats), 200

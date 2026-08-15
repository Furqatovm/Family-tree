from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.schemas.person_schema import PersonCreateSchema, PersonUpdateSchema, LocationUpdateSchema
from app.services.person_service import PersonService

person_bp = Blueprint('person', __name__, url_prefix='/api')

create_schema = PersonCreateSchema()
update_schema = PersonUpdateSchema()
location_schema = LocationUpdateSchema()

@person_bp.route('/families/<int:family_id>/people', methods=['GET'])
@jwt_required()
def get_people(family_id):
    user_id = int(get_jwt_identity())
    try:
        people = PersonService.get_people_by_family(family_id, user_id)
        return jsonify(people), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403
    except Exception as err:
        return jsonify({'error': str(err)}), 500

@person_bp.route('/families/<int:family_id>/people', methods=['POST'])
@jwt_required()
def create_person(family_id):
    user_id = int(get_jwt_identity())
    try:
        data = create_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation Error', 'details': err.messages}), 400

    try:
        person = PersonService.create_person(family_id, data, user_id)
        return jsonify(person), 201
    except ValueError as err:
        return jsonify({'error': str(err)}), 400
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403
    except Exception as err:
        from app.extensions import db
        db.session.rollback()
        return jsonify({'error': f'Inson qo\'shishda xatolik: {str(err)}'}), 500

@person_bp.route('/people/<int:person_id>', methods=['GET'])
@jwt_required()
def get_person(person_id):
    user_id = int(get_jwt_identity())
    try:
        person = PersonService.get_person_by_id(person_id, user_id)
        return jsonify(person.to_dict()), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

@person_bp.route('/people/<int:person_id>', methods=['PUT'])
@jwt_required()
def update_person(person_id):
    user_id = int(get_jwt_identity())
    try:
        data = update_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation Error', 'details': err.messages}), 400

    try:
        updated = PersonService.update_person(person_id, data, user_id)
        return jsonify(updated), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

@person_bp.route('/people/<int:person_id>/location', methods=['POST'])
@jwt_required()
def update_person_location(person_id):
    user_id = int(get_jwt_identity())
    try:
        data = location_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation Error', 'details': err.messages}), 400

    try:
        updated = PersonService.update_person_location(
            person_id=person_id,
            lat=data['latitude'],
            lng=data['longitude'],
            location_name=data.get('location_name'),
            status_message=data.get('status_message'),
            user_id=user_id
        )
        return jsonify(updated), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

@person_bp.route('/people/<int:person_id>/location-history', methods=['GET'])
@jwt_required()
def get_person_location_history(person_id):
    user_id = int(get_jwt_identity())
    try:
        history = PersonService.get_person_location_history(person_id, user_id)
        return jsonify(history), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

@person_bp.route('/people/<int:person_id>', methods=['DELETE'])
@jwt_required()
def delete_person(person_id):
    user_id = int(get_jwt_identity())
    try:
        PersonService.delete_person(person_id, user_id)
        return jsonify({'message': 'Person deleted successfully'}), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

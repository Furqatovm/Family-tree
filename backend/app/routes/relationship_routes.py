from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from app.schemas.relationship_schema import RelationshipCreateSchema
from app.services.relationship_service import RelationshipService

relationship_bp = Blueprint('relationship', __name__, url_prefix='/api')

create_schema = RelationshipCreateSchema()

@relationship_bp.route('/families/<int:family_id>/relationships', methods=['GET'])
@jwt_required()
def get_relationships(family_id):
    user_id = int(get_jwt_identity())
    try:
        relationships = RelationshipService.get_relationships_by_family(family_id, user_id)
        return jsonify(relationships), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

@relationship_bp.route('/families/<int:family_id>/relationships', methods=['POST'])
@jwt_required()
def create_relationship(family_id):
    user_id = int(get_jwt_identity())
    try:
        data = create_schema.load(request.get_json() or {})
    except ValidationError as err:
        return jsonify({'error': 'Validation Error', 'details': err.messages}), 400

    try:
        relationship = RelationshipService.create_relationship(family_id, data, user_id)
        return jsonify(relationship), 201
    except ValueError as err:
        return jsonify({'error': str(err)}), 400
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

@relationship_bp.route('/relationships/<int:relationship_id>', methods=['DELETE'])
@jwt_required()
def delete_relationship(relationship_id):
    user_id = int(get_jwt_identity())
    try:
        RelationshipService.delete_relationship(relationship_id, user_id)
        return jsonify({'message': 'Relationship deleted successfully'}), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

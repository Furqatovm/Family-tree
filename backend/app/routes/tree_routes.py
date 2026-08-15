from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.tree_service import TreeService

tree_bp = Blueprint('tree', __name__, url_prefix='/api')

@tree_bp.route('/families/<int:family_id>/tree', methods=['GET'])
@jwt_required()
def get_tree(family_id):
    user_id = int(get_jwt_identity())
    try:
        tree_data = TreeService.get_family_tree_data(family_id, user_id)
        return jsonify(tree_data), 200
    except ValueError as err:
        return jsonify({'error': str(err)}), 404
    except PermissionError as err:
        return jsonify({'error': str(err)}), 403

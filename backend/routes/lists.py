from flask import Blueprint, request, jsonify
from extensions import db
from models import TaskList
from utils.validators import ListSchema

lists_bp = Blueprint('lists', __name__)
list_schema = ListSchema()
lists_schema = ListSchema(many=True)

@lists_bp.route('', methods=['GET'])
def get_lists():
    all_lists = TaskList.query.all()
    return jsonify(lists_schema.dump(all_lists)), 200

@lists_bp.route('', methods=['POST'])
def create_list():
    data = request.json
    errors = list_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    new_list = TaskList(name=data['name'], color=data.get('color', '#3b82f6'))
    db.session.add(new_list)
    db.session.commit()
    return jsonify(list_schema.dump(new_list)), 201

@lists_bp.route('/<int:id>', methods=['PUT'])
def update_list(id):
    lst = TaskList.query.get_or_404(id)
    data = request.json
    lst.name = data.get('name', lst.name)
    lst.color = data.get('color', lst.color)
    db.session.commit()
    return jsonify(list_schema.dump(lst)), 200

@lists_bp.route('/<int:id>', methods=['DELETE'])
def delete_list(id):
    lst = TaskList.query.get_or_404(id)
    db.session.delete(lst)
    db.session.commit()
    return jsonify({"message": "List deleted"}), 200

from flask import Blueprint, request, jsonify
from extensions import db, limiter
from models import Task, TaskList, Tag, task_tags, TaskTemplate
from utils.validators import TaskSchema, TagSchema
from utils.stats_calculator import update_streak_logic, recalculate_list_counts
from sqlalchemy import or_

tasks_bp = Blueprint('tasks', __name__)
task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)

@tasks_bp.route('', methods=['GET'])
def get_tasks():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    list_id = request.args.get('list_id', type=int)
    priority = request.args.get('priority')
    search = request.args.get('search')
    
    query = Task.query
    
    if list_id:
        query = query.filter(Task.list_id == list_id)
    if priority:
        query = query.filter(Task.priority == priority)
    if search:
        query = query.filter(or_(Task.title.contains(search), Task.description.contains(search)))
        
    pagination = query.order_by(Task.created_at.desc()).paginate(page=page, per_page=limit, error_out=False)
    
    return jsonify({
        "data": tasks_schema.dump(pagination.items),
        "pagination": {
            "page": pagination.page,
            "limit": pagination.per_page,
            "total": pagination.total,
            "pages": pagination.pages
        },
        "filters": {
            "list_id": list_id,
            "priority": priority
        }
    }), 200

@tasks_bp.route('', methods=['POST'])
@limiter.limit("6 per minute")
def create_task():
    data = request.json
    errors = task_schema.validate(data)
    if errors:
        return jsonify(errors), 400
    
    new_task = Task(
        title=data['title'],
        description=data.get('description'),
        priority=data.get('priority', 'medium'),
        due_date=data.get('due_date'),
        list_id=data['list_id']
    )
    
    # Handle tags if provided
    if 'tags' in data:
        for tag_data in data['tags']:
            tag = Tag.query.filter_by(name=tag_data['name']).first()
            if not tag:
                tag = Tag(name=tag_data['name'], color=tag_data.get('color', '#6b7280'))
            new_task.tags.append(tag)
            
    db.session.add(new_task)
    db.session.commit()
    recalculate_list_counts()
    
    return jsonify({
        "id": new_task.id,
        "message": "Task created successfully",
        "is_overdue": False
    }), 201

@tasks_bp.route('/<int:id>', methods=['PUT'])
def update_task(id):
    task = Task.query.get_or_404(id)
    data = request.json
    
    was_completed = task.completed
    
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.priority = data.get('priority', task.priority)
    task.due_date = data.get('due_date', task.due_date)
    task.completed = data.get('completed', task.completed)
    
    if not was_completed and task.completed:
        update_streak_logic(db.session)
        
    db.session.commit()
    return jsonify(task_schema.dump(task)), 200

@tasks_bp.route('/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    recalculate_list_counts()
    return jsonify({"message": "Task deleted"}), 200

@tasks_bp.route('/bulk-complete', methods=['POST'])
def bulk_complete():
    ids = request.json.get('ids', [])
    tasks = Task.query.filter(Task.id.in_(ids)).all()
    for task in tasks:
        if not task.completed:
            task.completed = True
            update_streak_logic(db.session)
    db.session.commit()
    return jsonify({"message": f"{len(tasks)} tasks updated"}), 200

@tasks_bp.route('/templates', methods=['GET'])
def get_templates():
    templates = TaskTemplate.query.all()
    return jsonify([{
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "priority": t.priority,
        "due_offset_days": t.due_offset_days
    } for t in templates]), 200

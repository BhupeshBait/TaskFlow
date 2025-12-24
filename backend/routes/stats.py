from flask import Blueprint, jsonify
from extensions import db
from models import UserStats, Task
from utils.validators import StatsSchema
from utils.stats_calculator import get_weekly_completed_count
from sqlalchemy import func

stats_bp = Blueprint('stats', __name__)
stats_schema = StatsSchema()

@stats_bp.route('', methods=['GET'])
def get_stats():
    stats = UserStats.query.first()
    if not stats:
        stats = UserStats(current_streak=0, longest_streak=0, tasks_completed_today=0, tasks_completed_total=0)
        db.session.add(stats)
        db.session.commit()
    
    # Calculate additional dynamic fields
    total_ever = Task.query.count()
    completed_ever = Task.query.filter_by(completed=True).count()
    
    stats.tasks_completed_week = get_weekly_completed_count()
    rate = (completed_ever / total_ever * 100) if total_ever > 0 else 0
    stats.completion_rate = f"{round(rate, 1)}%"
    
    return jsonify(stats_schema.dump(stats)), 200

@stats_bp.route('/reset-streak', methods=['POST'])
def reset_streak():
    stats = UserStats.query.first()
    if stats:
        stats.current_streak = 0
        db.session.commit()
    return jsonify({"message": "Streak reset successfully"}), 200

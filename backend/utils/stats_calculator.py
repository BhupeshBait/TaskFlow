from datetime import date, timedelta
from models import UserStats, Task, db
from sqlalchemy import func

def update_streak_logic(session):
    """Updates streak data when a task is completed"""
    stats = session.query(UserStats).first()
    if not stats:
        stats = UserStats()
        session.add(stats)
    
    today = date.today()
    
    # If already completed tasks today, just increment daily total
    if stats.last_completed_date == today:
        stats.tasks_completed_today += 1
        stats.tasks_completed_total += 1
    else:
        # Check if yesterday was the last completion
        yesterday = today - timedelta(days=1)
        if stats.last_completed_date == yesterday:
            stats.current_streak += 1
        else:
            # Streak broken
            stats.current_streak = 1
        
        # Update longest streak
        if stats.current_streak > stats.longest_streak:
            stats.longest_streak = stats.current_streak
            
        stats.tasks_completed_today = 1
        stats.tasks_completed_total += 1
        stats.last_completed_date = today
    
    session.commit()

def get_weekly_completed_count():
    """Returns number of tasks completed in the last 7 days"""
    seven_days_ago = date.today() - timedelta(days=7)
    # Since tasks table might not store 'completed_at', we assume updated_at on completed tasks
    # For a real app, you'd add a 'completed_at' column
    return db.session.query(func.count(Task.id)).filter(
        Task.completed == True,
        Task.updated_at >= seven_days_ago
    ).scalar()

def recalculate_list_counts():
    """Sync task_count for all lists"""
    from models import TaskList
    lists = TaskList.query.all()
    for lst in lists:
        lst.task_count = Task.query.filter_by(list_id=lst.id).count()
    db.session.commit()

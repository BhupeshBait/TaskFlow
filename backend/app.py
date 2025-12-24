import structlog
from flask import Flask, jsonify
from extensions import db, ma, cors, limiter, jwt,migrate
from config import Config
from routes.tasks import tasks_bp
from routes.lists import lists_bp
from routes.stats import stats_bp
from routes.health import health_bp
from models import TaskList, Task, Tag, UserStats, TaskTemplate
from datetime import date, timedelta

logger = structlog.get_logger()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    migrate.init_app(app, db)
    db.init_app(app)
    ma.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config.get('FRONTEND_URL', 'http://localhost:5173')}})
    limiter.init_app(app)

    # Register blueprints
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    app.register_blueprint(lists_bp, url_prefix='/api/lists')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        logger.error("server_error", error=str(e))
        return jsonify({"error": "Internal server error"}), 500

    # Seed Database
    with app.app_context():
        db.create_all()
        seed_data()

    return app

def seed_data():
    if TaskList.query.first():
        return # Already seeded

    # Create Lists
    personal = TaskList(name="Personal", color="#ef4444")
    work = TaskList(name="Work", color="#3b82f6")
    shopping = TaskList(name="Shopping", color="#10b981")
    db.session.add_all([personal, work, shopping])
    db.session.flush()

    # Create Tags
    urgent = Tag(name="Urgent", color="#ef4444")
    db.session.add(urgent)

    # Create User Stats
    stats = UserStats(current_streak=5, longest_streak=12, tasks_completed_total=47)
    db.session.add(stats)

    # Create Tasks
    tasks = [
        Task(title="Complete API docs", description="Finish backend documentation", priority="high", list_id=work.id, due_date=date.today()),
        Task(title="Buy Milk", description="Need whole milk", priority="low", list_id=shopping.id),
        Task(title="Morning Workout", completed=True, priority="medium", list_id=personal.id, due_date=date.today() - timedelta(days=1)),
        Task(title="React Integration", priority="high", list_id=work.id, due_date=date.today() + timedelta(days=2)),
        Task(title="Call Mom", priority="medium", list_id=personal.id),
        Task(title="Read Book", priority="low", list_id=personal.id),
        Task(title="Grocery Run", priority="medium", list_id=shopping.id),
        Task(title="Debug Frontend", priority="high", list_id=work.id),
        Task(title="Plan Weekend", priority="low", list_id=personal.id),
        Task(title="Pay Bills", priority="high", list_id=personal.id, due_date=date.today())
    ]
    db.session.add_all(tasks)

    
    db.session.commit()
    
    # Update counts
    from utils.stats_calculator import recalculate_list_counts
    recalculate_list_counts()

app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

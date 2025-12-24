from datetime import datetime
from extensions import db
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Text, Boolean, Date, ForeignKey, Enum, Integer, Table, Column

# Many-to-Many association table for Task-Tags
task_tags = Table(
    'task_tags',
    db.metadata,
    Column('task_id', Integer, ForeignKey('tasks.id', ondelete='CASCADE'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id', ondelete='CASCADE'), primary_key=True)
)

class TaskList(db.Model):
    __tablename__ = 'task_lists'
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(7), default='#3b82f6')
    task_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    
    tasks = relationship("Task", back_populates="task_list", cascade="all, delete-orphan")

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    priority: Mapped[str] = mapped_column(Enum('low', 'medium', 'high'), default='medium')
    due_date: Mapped[datetime.date] = mapped_column(Date, nullable=True)
    list_id: Mapped[int] = mapped_column(ForeignKey('task_lists.id', ondelete='CASCADE'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)
    
    task_list = relationship("TaskList", back_populates="tasks")
    tags = relationship("Tag", secondary=task_tags, back_populates="tasks")

class Tag(db.Model):
    __tablename__ = 'tags'
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String(7), default='#6b7280')
    
    tasks = relationship("Task", secondary=task_tags, back_populates="tags")

class TaskTemplate(db.Model):
    __tablename__ = 'task_templates'
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    priority: Mapped[str] = mapped_column(Enum('low', 'medium', 'high'), default='medium')
    due_offset_days: Mapped[int] = mapped_column(default=0)
    list_id: Mapped[int] = mapped_column(ForeignKey('task_lists.id'), nullable=True)

class UserStats(db.Model):
    __tablename__ = 'user_stats'
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    current_streak: Mapped[int] = mapped_column(default=0)
    longest_streak: Mapped[int] = mapped_column(default=0)
    tasks_completed_today: Mapped[int] = mapped_column(default=0)
    tasks_completed_total: Mapped[int] = mapped_column(default=0)
    last_completed_date: Mapped[datetime.date] = mapped_column(Date, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(default=datetime.utcnow, onupdate=datetime.utcnow)

from marshmallow import Schema, fields, validate

class TagSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    color = fields.Str(validate=validate.Regexp(r'^#[0-9A-Fa-f]{6}$'))

class ListSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    color = fields.Str(validate=validate.Regexp(r'^#[0-9A-Fa-f]{6}$'))
    task_count = fields.Int(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

class TaskSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1))
    description = fields.Str(allow_none=True)
    completed = fields.Bool()
    priority = fields.Str(validate=validate.OneOf(['low', 'medium', 'high']))
    due_date = fields.Date(allow_none=True, format='%Y-%m-%d')
    list_id = fields.Int(required=True)
    is_overdue = fields.Method("get_is_overdue", dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    tags = fields.Nested(TagSchema, many=True)

    def get_is_overdue(self, obj):
        from datetime import date
        if obj.due_date and not obj.completed:
            return obj.due_date < date.today()
        return False

class StatsSchema(Schema):
    id = fields.Int(dump_only=True)
    current_streak = fields.Int()
    longest_streak = fields.Int()
    tasks_completed_today = fields.Int()
    tasks_completed_total = fields.Int()
    last_completed_date = fields.Date(allow_none=True, format='%Y-%m-%d')
    tasks_completed_week = fields.Method("get_week_stats")
    completion_rate = fields.Method("get_completion_rate")
    updated_at = fields.DateTime(dump_only=True)

    def get_week_stats(self, obj):
        # Calculated in the route context for simplicity
        return getattr(obj, 'tasks_completed_week', 0)

    def get_completion_rate(self, obj):
        # Return string percentage as per spec
        return getattr(obj, 'completion_rate', "0%")

import { useState, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { 
  Check, Circle, Trash2, Edit2, Calendar, Flag, 
  Tag, MoreHorizontal, GripVertical, AlertCircle
} from 'lucide-react';
import { Task, Tag as TagType, Priority } from '@/types';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  tags: TagType[];
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  showConfetti?: boolean;
}

const priorityConfig: Record<Priority, { color: string; label: string; bgClass: string }> = {
  high: { color: 'hsl(var(--destructive))', label: 'High', bgClass: 'priority-high' },
  medium: { color: 'hsl(var(--accent))', label: 'Medium', bgClass: 'priority-medium' },
  low: { color: 'hsl(var(--secondary))', label: 'Low', bgClass: 'priority-low' },
};

export function TaskItem({ task, tags, onToggle, onEdit, onDelete, showConfetti }: TaskItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const constraintsRef = useRef(null);

  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
  const taskTags = tags.filter((t) => task.tags.includes(t.id));
  const priority = priorityConfig[task.priority];

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.offset.x < -100) {
      onDelete(task.id);
    } else if (info.offset.x > 100) {
      onToggle(task.id);
    }
    setSwipeOffset(0);
  };

  return (
    <div ref={constraintsRef} className="relative overflow-hidden rounded-2xl">
      {/* Swipe action backgrounds */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-secondary/20 flex items-center justify-start pl-6">
          <Check className="w-6 h-6 text-secondary" />
        </div>
        <div className="w-1/2 bg-destructive/20 flex items-center justify-end pr-6">
          <Trash2 className="w-6 h-6 text-destructive" />
        </div>
      </div>

      {/* Task card */}
      <motion.div
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        onDrag={(_, info) => setSwipeOffset(info.offset.x)}
        animate={{ x: 0 }}
        className={cn(
          "relative neumorphic p-4 cursor-grab active:cursor-grabbing bg-card",
          "transition-all duration-200",
          task.completed && "opacity-60"
        )}
        layout
      >
        <div className="flex items-start gap-4">
          {/* Drag handle */}
          <div className="hidden sm:flex items-center text-muted-foreground opacity-50 hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Checkbox */}
          <button
            onClick={() => onToggle(task.id)}
            className={cn(
              "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center",
              "transition-all duration-200 touch-target",
              task.completed
                ? "bg-secondary border-secondary"
                : "border-muted-foreground/50 hover:border-primary"
            )}
            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
          >
            <AnimatePresence>
              {task.completed && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-secondary-foreground checkmark-animate" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "font-medium text-base leading-snug",
                task.completed && "line-through text-muted-foreground"
              )}>
                {task.title}
              </h3>
              
              {/* Priority badge */}
              <span className={cn(
                "flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full border",
                priority.bgClass
              )}>
                {priority.label}
              </span>
            </div>

            {task.description && (
              <p className={cn(
                "mt-1 text-sm text-muted-foreground line-clamp-2",
                task.completed && "line-through"
              )}>
                {task.description}
              </p>
            )}

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {task.dueDate && (
                <span className={cn(
                  "flex items-center gap-1 text-xs",
                  isOverdue ? "text-destructive font-medium" : "text-muted-foreground"
                )}>
                  {isOverdue && <AlertCircle className="w-3 h-3" />}
                  <Calendar className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              )}

              {taskTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {taskTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted"
                      style={{ color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(task)}
              className="p-2 rounded-lg hover:bg-muted transition-colors touch-target"
              aria-label="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors touch-target"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

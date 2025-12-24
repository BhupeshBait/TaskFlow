import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ChevronDown, Calendar, Flag, Tag, Sparkles } from 'lucide-react';
import { Priority, TaskList, Tag as TagType, TaskTemplate } from '@/types';
import { cn } from '@/lib/utils';

interface AddTaskBarProps {
  lists: TaskList[];
  tags: TagType[];
  templates: TaskTemplate[];
  selectedListId: string;
  onAddTask: (task: { 
    title: string; 
    description?: string;
    priority: Priority; 
    dueDate?: string; 
    listId: string;
    tags: string[];
  }) => void;
  onCreateFromTemplate: (templateId: string) => void;
}

export function AddTaskBar({ 
  lists, 
  tags, 
  templates,
  selectedListId, 
  onAddTask,
  onCreateFromTemplate 
}: AddTaskBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [listId, setListId] = useState(selectedListId === 'all' ? lists[0]?.id || '' : selectedListId);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      listId,
      tags: selectedTags,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setSelectedTags([]);
    setIsExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  return (
    <motion.div
      layout
      className={cn(
        "neumorphic bg-card overflow-hidden transition-all",
        isExpanded ? "rounded-2xl" : "rounded-full"
      )}
    >
      <form onSubmit={handleSubmit}>
        {/* Main input row */}
        <div className="flex items-center gap-3 p-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              "transition-all duration-200",
              isExpanded 
                ? "bg-primary text-primary-foreground rotate-45" 
                : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
            )}
            aria-label={isExpanded ? "Close add task" : "Add task"}
          >
            <Plus className="w-5 h-5" />
          </button>

          <input
            type="text"
            placeholder="Add a new task..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-base placeholder:text-muted-foreground"
            aria-label="Task title"
          />

          {!isExpanded && templates.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Use template"
            >
              <Sparkles className="w-5 h-5 text-accent" />
            </button>
          )}
        </div>

        {/* Expanded options */}
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border px-4 pb-4 space-y-4"
          >
            {/* Description */}
            <div className="pt-4">
              <textarea
                placeholder="Add description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground resize-none"
              />
            </div>

            {/* Options row */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Priority */}
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-muted-foreground" />
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
                        priority === p
                          ? p === 'high' ? "priority-high neumorphic-pressed" 
                            : p === 'medium' ? "priority-medium neumorphic-pressed"
                            : "priority-low neumorphic-pressed"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-transparent border border-border rounded-lg px-2 py-1 text-sm"
                />
              </div>

              {/* List selector */}
              <div className="relative">
                <select
                  value={listId}
                  onChange={(e) => setListId(e.target.value)}
                  className="appearance-none bg-muted border-none rounded-lg pl-3 pr-8 py-1.5 text-sm cursor-pointer"
                >
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Tag className="w-4 h-4 text-muted-foreground mt-1" />
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => {
                      setSelectedTags(prev => 
                        prev.includes(tag.id)
                          ? prev.filter(id => id !== tag.id)
                          : [...prev, tag.id]
                      );
                    }}
                    className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full transition-all",
                      selectedTags.includes(tag.id)
                        ? "neumorphic-pressed"
                        : "bg-muted hover:bg-muted/80"
                    )}
                    style={{
                      borderLeft: `3px solid ${tag.color}`,
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            )}

            {/* Submit button */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim()}
                className={cn(
                  "btn-neumorphic px-6 py-2 text-sm font-medium",
                  "bg-primary text-primary-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Add Task
              </button>
            </div>
          </motion.div>
        )}
      </form>

      {/* Templates dropdown */}
      {showTemplates && !isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-border p-3 space-y-2"
        >
          <p className="text-xs font-medium text-muted-foreground mb-2">Quick templates</p>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                onCreateFromTemplate(template.id);
                setShowTemplates(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <span className="font-medium text-sm">{template.title}</span>
              {template.description && (
                <p className="text-xs text-muted-foreground truncate">{template.description}</p>
              )}
            </button>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}

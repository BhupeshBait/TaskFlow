import { useState, useCallback, useEffect } from 'react';
import { Task, TaskList, Tag, UserStats, FilterState, TaskTemplate } from '@/types';
import { taskAPI, listAPI, statsAPI } from '@/services/api';

const STORAGE_KEY = 'taskflow-data';

interface StoredData {
  tasks: Task[];
  lists: TaskList[];
  tags: Tag[];
  templates: TaskTemplate[];
  stats: UserStats;
}

const defaultLists: TaskList[] = [
  { id: 'inbox', name: 'Inbox', color: '#6366f1', icon: 'inbox', taskCount: 0, createdAt: new Date().toISOString() },
  { id: 'work', name: 'Work', color: '#f59e0b', icon: 'briefcase', taskCount: 0, createdAt: new Date().toISOString() },
  { id: 'personal', name: 'Personal', color: '#10b981', icon: 'user', taskCount: 0, createdAt: new Date().toISOString() },
];

const defaultTags: Tag[] = [
  { id: 'urgent', name: 'Urgent', color: '#ef4444' },
  { id: 'focus', name: 'Focus', color: '#6366f1' },
  { id: 'quick', name: 'Quick Win', color: '#10b981' },
  { id: 'blocked', name: 'Blocked', color: '#f59e0b' },
];

const defaultStats: UserStats = {
  currentStreak: 0,
  longestStreak: 0,
  tasksCompletedToday: 0,
  tasksCompletedTotal: 0,
  lastCompletedDate: '',
};

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    description: 'Draft the Q1 project proposal with timeline and budget estimates',
    completed: false,
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    listId: 'work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['urgent', 'focus'],
    order: 0,
  },
  {
    id: '2',
    title: 'Review team feedback',
    description: 'Go through the feedback from last sprint retrospective',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    listId: 'work',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    order: 1,
  },
  {
    id: '3',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, vegetables',
    completed: true,
    priority: 'low',
    listId: 'personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['quick'],
    order: 0,
  },
  {
    id: '4',
    title: 'Schedule dentist appointment',
    completed: false,
    priority: 'medium',
    dueDate: new Date(Date.now() + 604800000).toISOString().split('T')[0],
    listId: 'personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    order: 1,
  },
  {
    id: '5',
    title: 'Learn TypeScript generics',
    description: 'Complete the advanced TypeScript course module',
    completed: false,
    priority: 'low',
    listId: 'inbox',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['focus'],
    order: 0,
  },
];

const defaultTemplates: TaskTemplate[] = [
  { id: 't1', title: 'Weekly Review', description: 'Review completed tasks and plan for next week', priority: 'medium', dueOffset: 7, listId: 'work' },
  { id: 't2', title: 'Daily Standup Prep', description: 'Prepare updates for daily standup', priority: 'high', dueOffset: 1, listId: 'work' },
];

function loadData(): StoredData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return {
    tasks: sampleTasks,
    lists: defaultLists,
    tags: defaultTags,
    templates: defaultTemplates,
    stats: { ...defaultStats, tasksCompletedTotal: 1 },
  };
}

function saveData(data: StoredData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

export function useTaskStore() {
  const [data, setData] = useState<StoredData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterState>({
    search: '',
    priority: 'all',
    completed: 'all',
    listId: 'all',
    tagIds: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Initialize data from API
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        const [listsRes, tasksRes, statsRes] = await Promise.all([
          listAPI.getLists(),
          taskAPI.getTasks(1, 1000),
          statsAPI.getStats(),
        ]);

        // Transform backend response to frontend format
        const lists: TaskList[] = (Array.isArray(listsRes) ? listsRes : []).map((list: any) => ({
          id: list.id?.toString() || '',
          name: list.name || '',
          color: list.color || '#3b82f6',
          icon: 'list',
          taskCount: list.task_count || 0,
          createdAt: list.created_at || new Date().toISOString(),
        }));

        let tasksArray: any[] = [];
        if (Array.isArray((tasksRes as any)?.data)) {
          tasksArray = (tasksRes as any).data;
        } else if (Array.isArray(tasksRes)) {
          tasksArray = tasksRes as any[];
        }
        
        const tasks: Task[] = tasksArray.map((task: any) => ({
          id: task.id?.toString() || '',
          title: task.title || '',
          description: task.description || '',
          completed: task.completed || false,
          priority: task.priority || 'medium',
          dueDate: task.due_date || undefined,
          listId: task.list_id?.toString() || '',
          createdAt: task.created_at || new Date().toISOString(),
          updatedAt: task.updated_at || new Date().toISOString(),
          tags: (task.tags || []).map((t: any) => t.id?.toString() || '').filter((id: string) => id),
          order: 0,
        }));

        const stats: UserStats = {
          currentStreak: (statsRes as any)?.current_streak ?? 0,
          longestStreak: (statsRes as any)?.longest_streak ?? 0,
          tasksCompletedToday: (statsRes as any)?.tasks_completed_today ?? 0,
          tasksCompletedTotal: (statsRes as any)?.tasks_completed_total ?? 0,
          lastCompletedDate: (statsRes as any)?.last_completed_date ?? '',
        };

        setData({
          tasks,
          lists,
          tags: [],
          templates: [],
          stats,
        });
        setError(null);
      } catch (err) {
        console.error('Failed to initialize data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        // Fallback to default data
        setData({
          tasks: [],
          lists: [
            { id: '1', name: 'Personal', color: '#10b981', icon: 'user', taskCount: 0, createdAt: new Date().toISOString() },
            { id: '2', name: 'Work', color: '#3b82f6', icon: 'briefcase', taskCount: 0, createdAt: new Date().toISOString() },
            { id: '3', name: 'Shopping', color: '#f59e0b', icon: 'shopping', taskCount: 0, createdAt: new Date().toISOString() },
          ],
          tags: [],
          templates: [],
          stats: {
            currentStreak: 0,
            longestStreak: 0,
            tasksCompletedToday: 0,
            tasksCompletedTotal: 0,
            lastCompletedDate: '',
          },
        });
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Task operations
  const addTask = useCallback(
    async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => {
      if (!data) return null;
      try {
        const listId = parseInt(task.listId, 10);
        if (isNaN(listId)) {
          console.error('Invalid list ID:', task.listId);
          return null;
        }

        const response: any = await taskAPI.createTask({
          title: task.title || '',
          description: task.description,
          priority: task.priority || 'medium',
          due_date: task.dueDate,
          list_id: listId,
        });

        const newTask: Task = {
          ...task,
          id: response?.id?.toString() || crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: 0,
        };

        setData(prev => prev ? { ...prev, tasks: [...prev.tasks, newTask] } : null);
        return newTask;
      } catch (err) {
        console.error('Failed to create task:', err);
        return null;
      }
    },
    [data]
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      if (!data) return;
      try {
        const taskId = parseInt(id, 10);
        if (isNaN(taskId)) {
          console.error('Invalid task ID:', id);
          return;
        }

        await taskAPI.updateTask(taskId, {
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          due_date: updates.dueDate,
          completed: updates.completed,
        });

        setData(prev =>
          prev
            ? {
              ...prev,
              tasks: prev.tasks.map(task =>
                task.id === id
                  ? { ...task, ...updates, updatedAt: new Date().toISOString() }
                  : task
              ),
            }
            : null
        );
      } catch (err) {
        console.error('Failed to update task:', err);
      }
    },
    [data]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      if (!data) return;
      try {
        const taskId = parseInt(id, 10);
        if (isNaN(taskId)) {
          console.error('Invalid task ID:', id);
          return;
        }

        await taskAPI.deleteTask(taskId);
        setData(prev => (prev ? { ...prev, tasks: prev.tasks.filter(t => t.id !== id) } : null));
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    },
    [data]
  );

  const toggleTaskComplete = useCallback(
    (id: string) => {
      if (!data) return;
      const task = data.tasks.find(t => t.id === id);
      if (!task) return;

      updateTask(id, { ...task, completed: !task.completed }).catch((err) => {
        console.error('Failed to toggle task:', err);
      });
    },
    [data, updateTask]
  );

  const reorderTasks = useCallback((listId: string, startIndex: number, endIndex: number) => {
    if (!data) return;
    setData(prev => {
      if (!prev) return null;
      const listTasks = [...prev.tasks.filter(t => t.listId === listId).sort((a, b) => a.order - b.order)];
      const [removed] = listTasks.splice(startIndex, 1);
      listTasks.splice(endIndex, 0, removed);
      
      const reordered = listTasks.map((task, index) => ({ ...task, order: index }));
      const otherTasks = prev.tasks.filter(t => t.listId !== listId);
      
      return { ...prev, tasks: [...otherTasks, ...reordered] };
    });
  }, [data]);

  // List operations
  const addList = useCallback(
    async (list: Omit<TaskList, 'id' | 'taskCount' | 'createdAt'>) => {
      if (!data) return null;
      try {
        const response: any = await listAPI.createList({
          name: list.name || '',
          color: list.color || '#3b82f6',
        });

        const newList: TaskList = {
          ...list,
          id: response?.id?.toString() || crypto.randomUUID(),
          taskCount: 0,
          createdAt: response?.created_at || new Date().toISOString(),
        };

        setData(prev => (prev ? { ...prev, lists: [...prev.lists, newList] } : null));
        return newList;
      } catch (err) {
        console.error('Failed to create list:', err);
        return null;
      }
    },
    [data]
  );

  const updateList = useCallback(
    async (id: string, updates: Partial<TaskList>) => {
      if (!data) return;
      try {
        const listId = parseInt(id, 10);
        if (isNaN(listId)) {
          console.error('Invalid list ID:', id);
          return;
        }

        await listAPI.updateList(listId, {
          name: updates.name,
          color: updates.color,
        });

        setData(prev =>
          prev
            ? {
              ...prev,
              lists: prev.lists.map(list => (list.id === id ? { ...list, ...updates } : list)),
            }
            : null
        );
      } catch (err) {
        console.error('Failed to update list:', err);
      }
    },
    [data]
  );

  const deleteList = useCallback(
    async (id: string) => {
      if (!data) return;
      try {
        const listId = parseInt(id, 10);
        if (isNaN(listId)) {
          console.error('Invalid list ID:', id);
          return;
        }

        await listAPI.deleteList(listId);
        setData(prev =>
          prev
            ? {
              ...prev,
              lists: prev.lists.filter(l => l.id !== id),
              tasks: prev.tasks.filter(t => t.listId !== id),
            }
            : null
        );
      } catch (err) {
        console.error('Failed to delete list:', err);
      }
    },
    [data]
  );

  // Tag operations
  const addTag = useCallback((tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = { ...tag, id: crypto.randomUUID() };
    setData(prev => (prev ? { ...prev, tags: [...prev.tags, newTag] } : null));
    return newTag;
  }, []);

  const deleteTag = useCallback((id: string) => {
    setData(prev =>
      prev
        ? {
          ...prev,
          tags: prev.tags.filter(t => t.id !== id),
          tasks: prev.tasks.map(task => ({
            ...task,
            tags: task.tags.filter(tagId => tagId !== id),
          })),
        }
        : null
    );
  }, []);

  // Template operations
  const createFromTemplate = useCallback(
    async (templateId: string) => {
      if (!data) return null;
      const template = data.templates.find(t => t.id === templateId);
      if (!template) return null;

      const dueDate = template.dueOffset
        ? new Date(Date.now() + template.dueOffset * 86400000).toISOString().split('T')[0]
        : undefined;

      try {
        const newTask = await addTask({
          title: template.title || '',
          description: template.description,
          priority: template.priority || 'medium',
          dueDate,
          listId: template.listId || '',
          completed: false,
          tags: [],
        });
        return newTask;
      } catch (err) {
        console.error('Failed to create task from template:', err);
        return null;
      }
    },
    [data, addTask]
  );

  // Filtered tasks
  const getFilteredTasks = useCallback(() => {
    if (!data) return [];
    
    let filtered = [...data.tasks];

    if (filter.search) {
      const search = filter.search.toLowerCase();
      filtered = filtered.filter(
        t => (t.title || '').toLowerCase().includes(search) || (t.description || '').toLowerCase().includes(search)
      );
    }

    if (filter.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filter.priority);
    }

    if (filter.completed !== 'all') {
      filtered = filtered.filter(t => (filter.completed === 'completed' ? t.completed : !t.completed));
    }

    if (filter.listId !== 'all') {
      filtered = filtered.filter(t => t.listId === filter.listId);
    }

    if (filter.tagIds.length > 0) {
      filtered = filtered.filter(t => filter.tagIds.some(tagId => (t.tags || []).includes(tagId)));
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filter.sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
          break;
        case 'dueDate':
          const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          comparison = aDate - bDate;
          break;
        case 'priority':
          const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
          comparison = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
          break;
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '');
          break;
        default:
          comparison = 0;
      }
      return filter.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, filter]);

  // Export/Import
  const exportTasks = useCallback(() => {
    if (!data) return '';
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importTasks = useCallback((jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString) as StoredData;
      setData(imported);
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    tasks: data?.tasks || [],
    lists: data?.lists || [],
    tags: data?.tags || [],
    templates: data?.templates || [],
    stats: data?.stats || {
      currentStreak: 0,
      longestStreak: 0,
      tasksCompletedToday: 0,
      tasksCompletedTotal: 0,
      lastCompletedDate: '',
    },
    filter,
    setFilter,
    getFilteredTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    reorderTasks,
    addList,
    updateList,
    deleteList,
    addTag,
    deleteTag,
    createFromTemplate,
    exportTasks,
    importTasks,
    loading,
    error,
  };
}

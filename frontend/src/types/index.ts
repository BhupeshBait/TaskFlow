export type Priority = 'low' | 'medium' | 'high';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string;
  listId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  order: number;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon: string;
  taskCount: number;
  createdAt: string;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueOffset: number; // days from now
  listId: string;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  tasksCompletedToday: number;
  tasksCompletedTotal: number;
  lastCompletedDate: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  reducedMotion: boolean;
  textSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
}

export interface FilterState {
  search: string;
  priority: Priority | 'all';
  completed: 'all' | 'completed' | 'incomplete';
  listId: string | 'all';
  tagIds: string[];
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}

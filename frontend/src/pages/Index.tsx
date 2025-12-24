import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Clock, Flame, Loader } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { FilterBar } from '@/components/FilterBar';
import { TaskList } from '@/components/TaskList';
import { AddTaskBar } from '@/components/AddTaskBar';
import { FocusMode } from '@/components/FocusMode';
import { TaskModal } from '@/components/TaskModal';
import { SettingsModal } from '@/components/SettingsModal';
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator';
import { useTaskStore } from '@/hooks/useTaskStore';
import { useTheme } from '@/hooks/useTheme';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { Task, Priority } from '@/types';
import { triggerConfetti, triggerMilestoneConfetti } from '@/utils/confetti';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const { theme, toggleTheme, setTheme } = useTheme();
  
  const {
    tasks,
    lists,
    tags,
    templates,
    stats,
    filter,
    setFilter,
    getFilteredTasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    addList,
    createFromTemplate,
    exportTasks,
    importTasks,
    loading,
    error,
  } = useTaskStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [focusTask, setFocusTask] = useState<Task | undefined>();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addListModalOpen, setAddListModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');

  const filteredTasks = getFilteredTasks();
  const selectedList = filter.listId === 'all' 
    ? null 
    : lists.find(l => l.id === filter.listId);

  const handleToggleTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      toggleTaskComplete(id);
      triggerConfetti();
      const newTotal = stats.tasksCompletedTotal + 1;
      if (triggerMilestoneConfetti(newTotal)) {
        toast({
          title: `🎉 Milestone reached!`,
          description: `You've completed ${newTotal} tasks!`,
        });
      } else {
        toast({
          title: 'Task completed!',
          description: 'Great job staying productive.',
        });
      }
    } else {
      toggleTaskComplete(id);
    }
  }, [tasks, toggleTaskComplete, stats.tasksCompletedTotal, toast]);

  const handleAddTask = useCallback((taskData: {
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string;
    listId: string;
    tags: string[];
  }) => {
    addTask({
      ...taskData,
      completed: false,
    });
    toast({
      title: 'Task added',
      description: 'Your new task has been created.',
    });
  }, [addTask, toast]);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  }, []);

  const handleSaveTask = useCallback((updates: Partial<Task>) => {
    if (editingTask) {
      updateTask(editingTask.id, updates);
      toast({
        title: 'Task updated',
        description: 'Your changes have been saved.',
      });
    }
    setEditingTask(undefined);
  }, [editingTask, updateTask, toast]);

  const handleDeleteTask = useCallback((id: string) => {
    deleteTask(id);
    toast({
      title: 'Task deleted',
      description: 'The task has been removed.',
    });
  }, [deleteTask, toast]);

  const handleStartFocus = useCallback((task?: Task) => {
    setFocusTask(task);
    setFocusModeOpen(true);
  }, []);

  const handleAddList = useCallback(() => {
    if (newListName.trim()) {
      const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];
      addList({
        name: newListName.trim(),
        color: colors[Math.floor(Math.random() * colors.length)],
        icon: 'inbox',
      });
      setNewListName('');
      setAddListModalOpen(false);
      toast({
        title: 'List created',
        description: `"${newListName.trim()}" has been added.`,
      });
    }
  }, [newListName, addList, toast]);

  const handleClearData = useCallback(() => {
    localStorage.removeItem('taskflow-data');
    window.location.reload();
  }, []);

  // Pull to refresh
  const handleRefresh = useCallback(async () => {
    // Simulate refresh delay for feedback
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: 'Refreshed',
      description: 'Task list is up to date.',
    });
  }, [toast]);

  const { containerRef, pullDistance, isRefreshing, progress } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  return (
    <div className="min-h-screen bg-background flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        lists={lists}
        stats={stats}
        selectedListId={filter.listId}
        onSelectList={(id) => {
          setFilter({ ...filter, listId: id });
          setSidebarOpen(false);
        }}
        onAddList={() => setAddListModalOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main
        ref={containerRef}
        className="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden overflow-y-auto"
      >
        {/* Loading state */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader className="w-8 h-8 text-primary" />
            </motion.div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="neumorphic bg-card rounded-2xl p-8 max-w-md text-center">
              <h2 className="text-lg font-semibold mb-2">Connection Error</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Make sure the backend server is running on http://localhost:5000
              </p>
              <button
                onClick={() => window.location.reload()}
                className="btn-neumorphic px-6 py-2 bg-primary text-primary-foreground"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Normal content */}
        {!loading && !error && (
          <>
            {/* Pull to refresh indicator */}
            <PullToRefreshIndicator 
              pullDistance={pullDistance} 
              isRefreshing={isRefreshing} 
              progress={progress} 
            />

            {/* Header */}
            <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-border">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="ml-12 lg:ml-0">
                    <h1 className="text-2xl font-bold">
                      {selectedList ? selectedList.name : 'All Tasks'}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      {filteredTasks.filter(t => !t.completed).length} tasks remaining
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Streak badge */}
                    {stats.currentStreak > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full neumorphic-sm bg-accent/10"
                      >
                        <Flame className="w-4 h-4 text-accent animate-flame" />
                        <span className="text-sm font-semibold">{stats.currentStreak}</span>
                      </motion.div>
                    )}

                    {/* Focus mode button */}
                    <button
                      onClick={() => handleStartFocus()}
                      className="btn-neumorphic flex items-center gap-2 px-4 py-2"
                      aria-label="Start focus mode"
                    >
                      <Target className="w-5 h-5" />
                      <span className="hidden sm:inline">Focus</span>
                    </button>
                  </div>
                </div>

                {/* Filter bar */}
                <FilterBar
                  filter={filter}
                  onFilterChange={(updates) => setFilter({ ...filter, ...updates })}
                  tags={tags}
                />
              </div>
            </header>

            {/* Task List */}
            <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
              <TaskList
                tasks={filteredTasks}
                tags={tags}
                onToggle={handleToggleTask}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onAddTask={() => setTaskModalOpen(true)}
              />
            </div>

            {/* Add Task Bar - Fixed at bottom on mobile */}
            <div className="sticky bottom-0 z-20 bg-gradient-to-t from-background via-background to-transparent pt-6 pb-4 safe-bottom">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <AddTaskBar
                  lists={lists}
                  tags={tags}
                  templates={templates}
                  selectedListId={filter.listId === 'all' ? lists[0]?.id : filter.listId}
                  onAddTask={handleAddTask}
                  onCreateFromTemplate={async (id) => {
                    const task = await createFromTemplate(id);
                    if (task) {
                      toast({
                        title: 'Task created from template',
                        description: `"${task.title}" has been added.`,
                      });
                    }
                  }}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <FocusMode
        isOpen={focusModeOpen}
        onClose={() => {
          setFocusModeOpen(false);
          setFocusTask(undefined);
        }}
        task={focusTask}
        onCompleteTask={focusTask ? () => handleToggleTask(focusTask.id) : undefined}
      />

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(undefined);
        }}
        task={editingTask}
        lists={lists}
        tags={tags}
        onSave={handleSaveTask}
        onDelete={editingTask ? () => handleDeleteTask(editingTask.id) : undefined}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        theme={theme}
        onThemeChange={setTheme}
        onExport={exportTasks}
        onImport={importTasks}
        onClearData={handleClearData}
      />

      {/* Add List Modal */}
      {addListModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setAddListModalOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm neumorphic bg-card rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold mb-4">New List</h2>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddList()}
              placeholder="List name"
              className="input-neumorphic mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAddListModalOpen(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddList}
                disabled={!newListName.trim()}
                className={cn(
                  "btn-neumorphic px-6 py-2 bg-primary text-primary-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                Create
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Index;

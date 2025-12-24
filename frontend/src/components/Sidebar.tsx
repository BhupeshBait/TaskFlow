import { motion } from 'framer-motion';
import { 
  Inbox, Briefcase, User, Plus, 
  Flame, Trophy, Settings, Moon, Sun, Monitor, Menu, X
} from 'lucide-react';
import { TaskList, UserStats } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  lists: TaskList[];
  stats: UserStats;
  selectedListId: string | 'all';
  onSelectList: (id: string | 'all') => void;
  onAddList: () => void;
  onOpenSettings: () => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  inbox: Inbox,
  briefcase: Briefcase,
  user: User,
};

export function Sidebar({
  lists,
  stats,
  selectedListId,
  onSelectList,
  onAddList,
  onOpenSettings,
  theme,
  onToggleTheme,
  isOpen,
  onToggle,
}: SidebarProps) {
  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const logoSrc = theme === 'dark' ? '/taskflow-logo-dark.png' : '/taskflow-logo-light.png';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar - Always visible on lg+, animated on mobile */}
      <aside
        className={cn(
          "fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-80 bg-sidebar",
          "flex flex-col h-screen border-r border-sidebar-border",
          "transition-transform duration-300 ease-out",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-4">
            <motion.img
              key={logoSrc}
              src={logoSrc}
              alt="TaskFlow Logo"
              className="w-12 h-12 rounded-2xl shadow-lg object-contain"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
            <div>
              <h1 className="font-bold text-xl text-sidebar-foreground">TaskFlow</h1>
              <p className="text-sm text-muted-foreground">Stay productive</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-xl hover:bg-sidebar-accent transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Card */}
        <div className="p-6">
          <div className="neumorphic p-5 bg-card rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Flame className={cn(
                  "w-6 h-6 text-accent",
                  stats.currentStreak > 0 && "animate-flame"
                )} />
                <span className="font-semibold">{stats.currentStreak} day streak</span>
              </div>
              <Trophy className="w-6 h-6 text-accent" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="neumorphic-sm p-4 rounded-2xl bg-card">
                <p className="text-2xl font-bold text-primary">{stats.tasksCompletedToday}</p>
                <p className="text-sm text-muted-foreground mt-1">Today</p>
              </div>
              <div className="neumorphic-sm p-4 rounded-2xl bg-card">
                <p className="text-2xl font-bold text-secondary">{stats.tasksCompletedTotal}</p>
                <p className="text-sm text-muted-foreground mt-1">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lists */}
        <nav className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="mb-3">
            <button
              onClick={() => onSelectList('all')}
              className={cn(
                "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all touch-target",
                selectedListId === 'all'
                  ? "neumorphic-pressed bg-primary/10 text-primary font-medium"
                  : "hover:bg-sidebar-accent"
              )}
            >
              <Inbox className="w-5 h-5" />
              <span className="flex-1 text-left text-base">All Tasks</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lists</span>
              <button
                onClick={onAddList}
                className="p-2 rounded-xl hover:bg-sidebar-accent transition-colors"
                aria-label="Add new list"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {lists.map((list, index) => {
              const Icon = iconMap[list.icon] || Inbox;
              return (
                <motion.button
                  key={list.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectList(list.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all touch-target",
                    selectedListId === list.id
                      ? "neumorphic-pressed bg-primary/10 text-primary font-medium"
                      : "hover:bg-sidebar-accent"
                  )}
                >
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: list.color }}
                  />
                  <span className="flex-1 text-left text-base">{list.name}</span>
                  {list.taskCount > 0 && (
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-muted text-muted-foreground">
                      {list.taskCount}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-sidebar-border space-y-3 mt-auto">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-sidebar-accent transition-all touch-target"
          >
            <ThemeIcon className="w-5 h-5" />
            <span className="flex-1 text-left text-base capitalize">{theme} Mode</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-sidebar-accent transition-all touch-target"
          >
            <Settings className="w-5 h-5" />
            <span className="flex-1 text-left text-base">Settings</span>
          </button>
        </div>
      </aside>

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className={cn(
          "fixed top-3 left-2 z-30 lg:hidden p-2 rounded-xl",
          "neumorphic bg-card"
        )}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}

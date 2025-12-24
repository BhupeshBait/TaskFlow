import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, SortAsc, SortDesc, X, ChevronDown } from 'lucide-react';
import { FilterState, Priority, Tag } from '@/types';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filter: FilterState;
  onFilterChange: (filter: Partial<FilterState>) => void;
  tags: Tag[];
}

export function FilterBar({ filter, onFilterChange, tags }: FilterBarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const priorityOptions: { value: Priority | 'all'; label: string }[] = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const completedOptions = [
    { value: 'all' as const, label: 'All Tasks' },
    { value: 'incomplete' as const, label: 'Incomplete' },
    { value: 'completed' as const, label: 'Completed' },
  ];

  const sortOptions: { value: FilterState['sortBy']; label: string }[] = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
  ];

  const hasActiveFilters = filter.priority !== 'all' || 
    filter.completed !== 'all' || 
    filter.tagIds.length > 0 ||
    filter.search;

  return (
    <div className="space-y-3">
      {/* Search and Filter Toggle */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filter.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="input-neumorphic pl-12 pr-4"
            aria-label="Search tasks"
          />
          {filter.search && (
            <button
              onClick={() => onFilterChange({ search: '' })}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "btn-neumorphic flex items-center gap-2 px-4",
            showFilters && "neumorphic-pressed"
          )}
          aria-expanded={showFilters}
          aria-label="Toggle filters"
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-primary" />
          )}
        </button>

        <button
          onClick={() => onFilterChange({ sortOrder: filter.sortOrder === 'asc' ? 'desc' : 'asc' })}
          className="btn-neumorphic px-4"
          aria-label={`Sort ${filter.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
        >
          {filter.sortOrder === 'asc' ? (
            <SortAsc className="w-5 h-5" />
          ) : (
            <SortDesc className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="neumorphic p-4 bg-card space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <div className="relative">
                    <select
                      value={filter.priority}
                      onChange={(e) => onFilterChange({ priority: e.target.value as Priority | 'all' })}
                      className="input-neumorphic appearance-none cursor-pointer pr-10"
                    >
                      {priorityOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <div className="relative">
                    <select
                      value={filter.completed}
                      onChange={(e) => onFilterChange({ completed: e.target.value as 'all' | 'completed' | 'incomplete' })}
                      className="input-neumorphic appearance-none cursor-pointer pr-10"
                    >
                      {completedOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium mb-2">Sort By</label>
                  <div className="relative">
                    <select
                      value={filter.sortBy}
                      onChange={(e) => onFilterChange({ sortBy: e.target.value as FilterState['sortBy'] })}
                      className="input-neumorphic appearance-none cursor-pointer pr-10"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-muted-foreground" />
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => onFilterChange({
                      search: '',
                      priority: 'all',
                      completed: 'all',
                      tagIds: [],
                      sortBy: 'createdAt',
                      sortOrder: 'desc',
                    })}
                    className="btn-neumorphic w-full text-muted-foreground hover:text-foreground"
                    disabled={!hasActiveFilters}
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => {
                          const newTagIds = filter.tagIds.includes(tag.id)
                            ? filter.tagIds.filter((id) => id !== tag.id)
                            : [...filter.tagIds, tag.id];
                          onFilterChange({ tagIds: newTagIds });
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                          filter.tagIds.includes(tag.id)
                            ? "neumorphic-pressed"
                            : "neumorphic-sm hover:shadow-neumorphic-hover"
                        )}
                        style={{
                          borderLeft: `3px solid ${tag.color}`,
                        }}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

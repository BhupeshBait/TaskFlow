import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
  threshold?: number;
}

export function PullToRefreshIndicator({ 
  pullDistance, 
  isRefreshing, 
  progress,
  threshold = 80 
}: PullToRefreshIndicatorProps) {
  if (pullDistance <= 0 && !isRefreshing) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ 
        height: pullDistance,
        minHeight: isRefreshing ? threshold * 0.6 : 0
      }}
      className="flex items-center justify-center overflow-hidden"
    >
      <motion.div
        animate={{ 
          rotate: isRefreshing ? 360 : progress * 180,
          scale: Math.min(0.5 + progress * 0.5, 1)
        }}
        transition={{ 
          rotate: isRefreshing 
            ? { repeat: Infinity, duration: 0.8, ease: 'linear' } 
            : { duration: 0 }
        }}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          "neumorphic bg-card"
        )}
      >
        <RefreshCw 
          className={cn(
            "w-5 h-5 transition-colors",
            progress >= 1 || isRefreshing ? "text-primary" : "text-muted-foreground"
          )} 
        />
      </motion.div>
    </motion.div>
  );
}

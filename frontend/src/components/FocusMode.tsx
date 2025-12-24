import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, RotateCcw, Check, Coffee, Target } from 'lucide-react';
import { Task } from '@/types';
import { cn } from '@/lib/utils';

interface FocusModeProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task;
  onCompleteTask?: () => void;
}

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

export function FocusMode({ isOpen, onClose, task, onCompleteTask }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const progress = isBreak 
    ? ((BREAK_DURATION - timeLeft) / BREAK_DURATION) * 100
    : ((FOCUS_DURATION - timeLeft) / FOCUS_DURATION) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isBreak) {
        // Break finished, start new focus session
        setIsBreak(false);
        setTimeLeft(FOCUS_DURATION);
        setIsRunning(false);
      } else {
        // Focus finished, start break
        setCompletedPomodoros((prev) => prev + 1);
        setIsBreak(true);
        setTimeLeft(BREAK_DURATION);
        setIsRunning(false);
        
        // Play notification sound (if available)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Focus session complete! 🎉', {
            body: 'Time for a 5-minute break.',
          });
        }
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setTimeLeft(isBreak ? BREAK_DURATION : FOCUS_DURATION);
    setIsRunning(false);
  };

  const handleSkipBreak = () => {
    setIsBreak(false);
    setTimeLeft(FOCUS_DURATION);
    setIsRunning(false);
  };

  const handleClose = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(FOCUS_DURATION);
    setIsBreak(false);
    onClose();
  }, [onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
      if (e.key === ' ' && isOpen) {
        e.preventDefault();
        setIsRunning((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="focus-overlay flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Focus mode"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-lg"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-3 rounded-full neumorphic bg-card touch-target"
              aria-label="Close focus mode"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Main content */}
            <div className="neumorphic bg-card p-8 rounded-3xl text-center">
              {/* Mode indicator */}
              <div className="flex items-center justify-center gap-2 mb-6">
                {isBreak ? (
                  <>
                    <Coffee className="w-6 h-6 text-secondary" />
                    <span className="text-lg font-medium text-secondary">Break Time</span>
                  </>
                ) : (
                  <>
                    <Target className="w-6 h-6 text-primary" />
                    <span className="text-lg font-medium text-primary">Focus Mode</span>
                  </>
                )}
              </div>

              {/* Timer circle */}
              <div className="relative w-64 h-64 mx-auto mb-8">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke={isBreak ? "hsl(var(--secondary))" : "hsl(var(--primary))"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Timer display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-bold tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-muted-foreground mt-2">
                    {isBreak ? 'Take a break' : 'Stay focused'}
                  </span>
                </div>
              </div>

              {/* Task info */}
              {task && !isBreak && (
                <div className="neumorphic-pressed rounded-xl p-4 mb-6 text-left bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Currently focusing on:</p>
                  <p className="font-medium">{task.title}</p>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="btn-neumorphic p-4 rounded-full"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center",
                    "transition-all duration-200",
                    isRunning
                      ? "neumorphic-pressed bg-muted"
                      : "neumorphic bg-primary text-primary-foreground"
                  )}
                  aria-label={isRunning ? 'Pause' : 'Start'}
                >
                  {isRunning ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </button>

                {task && onCompleteTask && !isBreak ? (
                  <button
                    onClick={() => {
                      onCompleteTask();
                      handleClose();
                    }}
                    className="btn-neumorphic p-4 rounded-full bg-secondary text-secondary-foreground"
                    aria-label="Complete task"
                  >
                    <Check className="w-6 h-6" />
                  </button>
                ) : isBreak ? (
                  <button
                    onClick={handleSkipBreak}
                    className="btn-neumorphic px-4 py-2 text-sm"
                  >
                    Skip Break
                  </button>
                ) : (
                  <div className="w-14" /> // Spacer
                )}
              </div>

              {/* Pomodoro counter */}
              <div className="mt-8 flex items-center justify-center gap-2">
                <span className="text-sm text-muted-foreground">Sessions completed:</span>
                <div className="flex gap-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-3 h-3 rounded-full transition-colors",
                        i < completedPomodoros % 4
                          ? "bg-primary"
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
                <span className="font-medium">{completedPomodoros}</span>
              </div>

              {/* Keyboard hint */}
              <p className="text-xs text-muted-foreground mt-4">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Space</kbd> to play/pause • <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Esc</kbd> to close
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

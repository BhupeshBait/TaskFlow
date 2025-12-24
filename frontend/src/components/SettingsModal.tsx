import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Moon, Sun, Monitor, Eye, Type, Volume2, VolumeX, 
  Download, Upload, Trash2, RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onExport: () => string;
  onImport: (data: string) => boolean;
  onClearData: () => void;
}

export function SettingsModal({ 
  isOpen, 
  onClose, 
  theme, 
  onThemeChange,
  onExport,
  onImport,
  onClearData
}: SettingsModalProps) {
  const [highContrast, setHighContrast] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [importError, setImportError] = useState('');

  const handleExport = () => {
    const data = onExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImport(content);
      if (!success) {
        setImportError('Invalid backup file. Please try again.');
        setTimeout(() => setImportError(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      onClearData();
      onClose();
    }
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  const textSizeOptions = [
    { value: 'small' as const, label: 'Small', size: '14px' },
    { value: 'medium' as const, label: 'Medium', size: '16px' },
    { value: 'large' as const, label: 'Large', size: '18px' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg neumorphic bg-card rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
              <h2 className="text-xl font-semibold">Settings</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-muted transition-colors touch-target"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Appearance Section */}
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Appearance
                </h3>

                {/* Theme */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Theme</label>
                  <div className="flex gap-2">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => onThemeChange(option.value)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all",
                          theme === option.value
                            ? "neumorphic-pressed bg-primary/10 text-primary"
                            : "neumorphic-sm hover:shadow-neumorphic-hover"
                        )}
                      >
                        <option.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Size */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-3">
                    <Type className="w-4 h-4" />
                    Text Size
                  </label>
                  <div className="flex gap-2">
                    {textSizeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTextSize(option.value)}
                        className={cn(
                          "flex-1 px-4 py-3 rounded-xl transition-all text-center",
                          textSize === option.value
                            ? "neumorphic-pressed bg-primary/10 text-primary"
                            : "neumorphic-sm hover:shadow-neumorphic-hover"
                        )}
                        style={{ fontSize: option.size }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Accessibility Section */}
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Accessibility
                </h3>

                <div className="space-y-4">
                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">High Contrast</p>
                        <p className="text-sm text-muted-foreground">Increase color contrast</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setHighContrast(!highContrast)}
                      className={cn(
                        "w-12 h-7 rounded-full transition-all relative",
                        highContrast ? "bg-primary" : "bg-muted"
                      )}
                      role="switch"
                      aria-checked={highContrast}
                    >
                      <span
                        className={cn(
                          "absolute top-1 w-5 h-5 rounded-full bg-card shadow transition-all",
                          highContrast ? "left-6" : "left-1"
                        )}
                      />
                    </button>
                  </div>

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Reduced Motion</p>
                        <p className="text-sm text-muted-foreground">Minimize animations</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReducedMotion(!reducedMotion)}
                      className={cn(
                        "w-12 h-7 rounded-full transition-all relative",
                        reducedMotion ? "bg-primary" : "bg-muted"
                      )}
                      role="switch"
                      aria-checked={reducedMotion}
                    >
                      <span
                        className={cn(
                          "absolute top-1 w-5 h-5 rounded-full bg-card shadow transition-all",
                          reducedMotion ? "left-6" : "left-1"
                        )}
                      />
                    </button>
                  </div>

                  {/* Sound */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {soundEnabled ? (
                        <Volume2 className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">Sound Effects</p>
                        <p className="text-sm text-muted-foreground">Play sounds on actions</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={cn(
                        "w-12 h-7 rounded-full transition-all relative",
                        soundEnabled ? "bg-primary" : "bg-muted"
                      )}
                      role="switch"
                      aria-checked={soundEnabled}
                    >
                      <span
                        className={cn(
                          "absolute top-1 w-5 h-5 rounded-full bg-card shadow transition-all",
                          soundEnabled ? "left-6" : "left-1"
                        )}
                      />
                    </button>
                  </div>
                </div>
              </section>

              {/* Data Section */}
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Data
                </h3>

                <div className="space-y-3">
                  {/* Export */}
                  <button
                    onClick={handleExport}
                    className="w-full btn-neumorphic flex items-center justify-center gap-3 py-3"
                  >
                    <Download className="w-5 h-5" />
                    Export Backup
                  </button>

                  {/* Import */}
                  <label className="w-full btn-neumorphic flex items-center justify-center gap-3 py-3 cursor-pointer">
                    <Upload className="w-5 h-5" />
                    Import Backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>
                  {importError && (
                    <p className="text-sm text-destructive text-center">{importError}</p>
                  )}

                  {/* Clear Data */}
                  <button
                    onClick={handleClearData}
                    className="w-full btn-neumorphic flex items-center justify-center gap-3 py-3 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear All Data
                  </button>
                </div>
              </section>

              {/* Version */}
              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">TaskFlow v1.0.0</p>
                <p className="text-xs text-muted-foreground mt-1">Built with Lovable</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

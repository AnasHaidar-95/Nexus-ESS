import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle, Sparkles } from 'lucide-react';
import { useNotificationStore, Toast } from '../stores/notificationStore';

export default function ToastContainer() {
  const toasts = useNotificationStore((s) => s.toasts);
  const dismissToast = useNotificationStore((s) => s.dismissToast);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const icons: Record<string, React.ReactNode> = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
    sparkle: <Sparkles className="h-5 w-5 text-indigo-500 shrink-0" />,
  };

  const bgStyles: Record<string, string> = {
    success: 'bg-white dark:bg-slate-900 border-l-4 border-emerald-500 text-slate-800 dark:text-slate-100 shadow-xl border border-slate-100 dark:border-slate-800',
    info: 'bg-white dark:bg-slate-900 border-l-4 border-blue-500 text-slate-800 dark:text-slate-100 shadow-xl border border-slate-100 dark:border-slate-800',
    warning: 'bg-white dark:bg-slate-900 border-l-4 border-amber-500 text-slate-800 dark:text-slate-100 shadow-xl border border-slate-100 dark:border-slate-800',
    error: 'bg-white dark:bg-slate-900 border-l-4 border-rose-500 text-slate-800 dark:text-slate-100 shadow-xl border border-slate-100 dark:border-slate-800',
    sparkle: 'bg-white dark:bg-slate-900 border-l-4 border-indigo-500 text-slate-800 dark:text-slate-100 shadow-xl border border-slate-100 dark:border-slate-800',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: 50, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl ${bgStyles[toast.type]} font-sans`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none mb-1">{toast.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{toast.message}</p>
      </div>
      <button onClick={() => onDismiss(toast.id)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}

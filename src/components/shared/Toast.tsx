import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons: Record<ToastType, React.ReactNode> = {
    success: <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <FiAlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <FiInfo className="w-5 h-5 text-cyan-400 shrink-0" />,
  };

  const borderClasses: Record<ToastType, string> = {
    success: 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    error: 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    info: 'border-cyan-500/50 shadow-[0_0_20px_rgba(0,240,255,0.2)]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      layout
      className={`flex items-start gap-3 p-4 rounded-xl bg-slate-900/90 backdrop-blur-md border ${borderClasses[toast.type]} text-slate-100 min-w-[300px] max-w-md`}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <h4 className="text-sm font-bold tracking-wide">{toast.title}</h4>
        {toast.description && <p className="text-xs text-slate-300 mt-1">{toast.description}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
      >
        <FiX className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

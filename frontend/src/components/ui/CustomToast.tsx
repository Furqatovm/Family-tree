import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

// Global listener pattern for toast triggers
type ToastListener = (toast: ToastMessage) => void;
const listeners = new Set<ToastListener>();

export const toast = {
  show: (type: ToastType, title: string, description?: string, duration = 4500) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toastMsg: ToastMessage = { id, type, title, description, duration };
    listeners.forEach((listener) => listener(toastMsg));
  },
  success: (title: string, description?: string) => toast.show('success', title, description),
  error: (title: string, description?: string) => toast.show('error', title, description),
  warning: (title: string, description?: string) => toast.show('warning', title, description),
  info: (title: string, description?: string) => toast.show('info', title, description),
};

export const CustomToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleAddToast = (newToast: ToastMessage) => {
      setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 toasts
    };

    listeners.add(handleAddToast);
    return () => {
      listeners.delete(handleAddToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onClose: () => void }> = ({ toast: t, onClose }) => {
  const duration = t.duration || 4500;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTheme = () => {
    switch (t.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          badgeBg: 'bg-emerald-50 border-emerald-200/60 text-emerald-700',
          barBg: 'bg-[#3F6B4F]',
          defaultTitle: 'Muvaffaqiyatli',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-600" />,
          badgeBg: 'bg-rose-50 border-rose-200/60 text-rose-700',
          barBg: 'bg-rose-500',
          defaultTitle: 'Xatolik Yuz Berdi',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          badgeBg: 'bg-amber-50 border-amber-200/60 text-amber-700',
          barBg: 'bg-amber-500',
          defaultTitle: 'Diqqat',
        };
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-600" />,
          badgeBg: 'bg-blue-50 border-blue-200/60 text-blue-700',
          barBg: 'bg-blue-500',
          defaultTitle: 'Ma\'lumot',
        };
    }
  };

  const theme = getTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 80, scale: 0.95, filter: 'blur(4px)' }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="pointer-events-auto relative w-full bg-white/95 backdrop-blur-xl border border-[#E7E5E4] rounded-2xl shadow-floating overflow-hidden p-4 flex gap-3.5 items-start group"
    >
      {/* Icon Badge */}
      <div className={`p-2 rounded-xl border flex items-center justify-center flex-shrink-0 ${theme.badgeBg}`}>
        {theme.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
        <h4 className="font-serif font-bold text-sm text-[#1C1917] tracking-tight leading-snug">
          {t.title || theme.defaultTitle}
        </h4>
        {t.description && (
          <p className="text-xs text-[#57534E] leading-relaxed break-words font-medium">
            {t.description}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-[#A8A29E] hover:text-[#1C1917] hover:bg-[#FAFAF9] transition-colors flex-shrink-0 -mr-1 -mt-1"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Auto-Dismiss Bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        className={`absolute bottom-0 left-0 right-0 h-1 ${theme.barBg} opacity-80`}
      />
    </motion.div>
  );
};

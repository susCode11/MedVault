import React from 'react';
import { useNotificationStore, Notification as ToastType } from '../../store/notificationStore';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-success-400" size={24} />,
  error: <AlertCircle className="text-danger-400" size={24} />,
  warning: <AlertTriangle className="text-warning-400" size={24} />,
  info: <Info className="text-info-400" size={24} />,
  emergency: <AlertCircle className="text-danger-500" size={24} />
};

export const ToastItem: React.FC<{ toast: ToastType; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl bg-surface-card border border-surface-border shadow-glass-lg ring-1 ring-black ring-opacity-5 animate-slide-in-right">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icons[toast.type as keyof typeof icons]}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium text-gray-100">{toast.title}</p>
            {toast.message && <p className="mt-1 text-sm text-gray-400">{toast.message}</p>}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              type="button"
              className="inline-flex rounded-md bg-surface-card text-gray-400 hover:text-gray-300 focus:outline-none"
              onClick={() => onRemove(toast.id)}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { notifications: toasts, removeNotification: removeToast } = useNotificationStore();

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast: ToastType) => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </div>
  );
};

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface NotificationStore {
  toasts: Toast[];
  emergencyBannerVisible: boolean;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showEmergencyBanner: () => void;
  dismissBanner: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  toasts: [],
  emergencyBannerVisible: false,

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    
    // Auto remove
    const duration = toast.duration || 3000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  showEmergencyBanner: () => set({ emergencyBannerVisible: true }),
  dismissBanner: () => set({ emergencyBannerVisible: false }),
}));

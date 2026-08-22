import { create } from 'zustand';

interface PortalState {
  activePortal: 'patient' | 'doctor';
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light' | 'system';
  switchPortal: (portal: 'patient' | 'doctor') => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'dark' | 'light' | 'system') => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  activePortal: 'patient',
  sidebarCollapsed: false,
  theme: 'dark', // default to dark as requested
  switchPortal: (portal) => set({ activePortal: portal }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setTheme: (theme) => {
    set({ theme });
    // Side effect to update document class
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  },
}));

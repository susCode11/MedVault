import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, UserProfile, UserRole } from '../types/auth';
import { api } from '../lib/api';

interface AuthStore extends AuthState {
  login: (principal: string) => Promise<void>;
  logout: () => void;
  setRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      principal: null,
      role: null,
      error: null,

      login: async (principal: string) => {
        set({ isLoading: true, error: null });
        try {
          // TODO (Workstream 2): Use NFID to get delegation chain and send to backend
          const { token, user } = await api.auth.login(principal);
          set({
            isAuthenticated: true,
            user,
            token,
            principal,
            role: user.role,
            isLoading: false,
          });
        } catch (err: any) {
          set({ error: err.message, isLoading: false });
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          principal: null,
          role: null,
          error: null,
        });
      },

      setRole: (role: UserRole) => {
        const user = get().user;
        if (user) {
          set({ role, user: { ...user, role } });
        }
      },

      updateProfile: (updates: Partial<UserProfile>) => {
        const user = get().user;
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
      // We don't persist isLoading or error
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        principal: state.principal,
        role: state.role,
      }),
    }
  )
);

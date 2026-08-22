import { create } from 'zustand';
import { AuthState, UserRole, LoginOptions } from '../types/auth';
import { initNFID, login, logout, isAuthenticated } from '../lib/nfid';
import { recreateAgent } from '../lib/agent';
import { recreateActor } from '../lib/canister';

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  loginWithNFID: (options?: LoginOptions) => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: UserRole) => void;
  // TODO (Workstream - User Profiles): Add setProfile action
}

export const useAuthStore = create<AuthStore>((set) => ({
  identity: null,
  principal: null,
  principalText: null,
  isAuthenticated: false,
  isLoading: true,
  role: null,
  error: null,
  profile: null,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const identity = await initNFID();
      const isAuth = await isAuthenticated();
      const principal = identity.getPrincipal();
      
      set({
        identity: isAuth ? identity : null,
        principal: isAuth ? principal : null,
        principalText: isAuth ? principal.toText() : null,
        isAuthenticated: isAuth,
        error: null,
        isLoading: false,
      });

      if (isAuth) {
        await recreateAgent();
        await recreateActor();
      }
    } catch (error: any) {
      set({ error: error.message || 'Initialization failed', isLoading: false });
    }
  },

  loginWithNFID: async (options?: LoginOptions) => {
    set({ isLoading: true, error: null });
    try {
      const identity = await login(options);
      const principal = identity.getPrincipal();
      
      await recreateAgent();
      await recreateActor();

      set({
        identity,
        principal,
        principalText: principal.toText(),
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Login failed', isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await logout();
      await recreateAgent(); // Will recreate with anonymous identity
      await recreateActor();

      set({
        identity: null,
        principal: null,
        principalText: null,
        isAuthenticated: false,
        role: null,
        isLoading: false,
      });
    } catch (error: any) {
      set({ error: error.message || 'Logout failed', isLoading: false });
    }
  },

  setRole: (role: UserRole) => {
    set({ role });
  },
}));

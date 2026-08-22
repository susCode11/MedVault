// =============================================================================
// MedVault — Auth Store
// Workstream 3: Client State & Integration
//
// Central authentication state for the entire client application.
// Manages the NFID identity, ICP principal, user profile, and session lifecycle.
//
// Consumed by (Workstream 4 — FROZEN API):
//   - AuthGuard.tsx    — reads isAuthenticated, isLoading
//   - RoleGuard.tsx    — reads role, isPatient, isDoctor
//   - LoginButton.tsx  — calls login(), reads isLoading, error
//   - ProfileMenu.tsx  — reads profile, principal, calls logout()
//   - AbhaLinkForm.tsx — reads profile.abhaId
//
// Consumed by (Workstream 3 hooks):
//   - useAuth.ts       — reads/writes all state, calls login/logout
//   - useCanister.ts   — reads identity and principal for actor creation
//
// Consumed by (Workstream 2 — injection point):
//   - nfid.ts          — MUST call setAdapter(realNfidAdapter) once ready
//   - main.tsx (W4)    — the ONE place setAdapter() is called at app boot
//
// =============================================================================
//
// ┌─────────────────────────────────────────────────────────────────┐
// │  AuthAdapter Pattern (Conflict 1 mitigation)                    │
// │                                                                 │
// │  Problem: authStore needs login/logout from nfid.ts (W2),       │
// │           but nfid.ts is not yet implemented.                   │
// │                                                                 │
// │  Solution: The store depends on an AuthAdapter INTERFACE,       │
// │            not on nfid.ts directly. A mockAuthAdapter is        │
// │            shipped inline and used by default.                  │
// │                                                                 │
// │  When W2 delivers nfid.ts, they call:                          │
// │    useAuthStore.getState().setAdapter(realNfidAdapter)          │
// │  from main.tsx (one line). Everything else stays unchanged.     │
// └─────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────┐
// │  Self-Initialization (Conflict 2 mitigation)                    │
// │                                                                 │
// │  The store calls init() internally — it does NOT wait for       │
// │  main.tsx or any external bootstrap call. This ensures the      │
// │  auth state is always correct regardless of provider order.     │
// └─────────────────────────────────────────────────────────────────┘
//
// ┌─────────────────────────────────────────────────────────────────┐
// │  Persistence Security                                            │
// │                                                                 │
// │  PERSISTED (safe):   principal, role, profile, sessionExpiresAt │
// │  NEVER PERSISTED:    identity, _adapter, isLoading, error       │
// │                                                                 │
// │  The identity object contains delegation keys — storing them    │
// │  in localStorage would be a critical security vulnerability.    │
// └─────────────────────────────────────────────────────────────────┘

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProfile, UserRole } from '../types/auth';
import { usePortalStore } from './portalStore';
import { useNotificationStore } from './notificationStore';

// ---------------------------------------------------------------------------
// AuthAdapter Interface
// ---------------------------------------------------------------------------

/**
 * The contract that any auth provider (NFID, mock, test) must satisfy.
 *
 * Workstream 2 must implement this interface in nfid.ts and inject it
 * via authStore.getState().setAdapter(realNfidAdapter) in main.tsx.
 */
export interface AuthAdapter {
  /**
   * Trigger the provider's login flow (e.g. NFID popup).
   * Resolves with session credentials on success.
   * Throws on cancellation or failure.
   */
  login: () => Promise<{
    /** ICP principal as text string. */
    principal: string;
    /**
     * The Identity object from @dfinity/agent.
     * Typed as `unknown` here to avoid importing @dfinity/agent in this file.
     */
    identity: unknown;
    /** Unix timestamp (ms) when the delegation expires. */
    expiresAt: number;
  }>;

  /** Terminate the session and clear provider state. */
  logout: () => Promise<void>;

  /**
   * Check if an existing session is still valid (e.g. on page reload).
   * Returns session credentials if a valid session exists, null otherwise.
   */
  checkAuth: () => Promise<{
    principal: string;
    identity: unknown;
    expiresAt: number;
  } | null>;
}

// ---------------------------------------------------------------------------
// Mock Adapter (default — used until W2 delivers nfid.ts)
// ---------------------------------------------------------------------------

const MOCK_PRINCIPAL = 'mock-patient-2vxsx-fae';
const MOCK_SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const mockAuthAdapter: AuthAdapter = {
  login: async () => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));
    return {
      principal: MOCK_PRINCIPAL,
      identity: { type: 'mock' },
      expiresAt: Date.now() + MOCK_SESSION_DURATION_MS,
    };
  },

  logout: async () => {
    await new Promise((r) => setTimeout(r, 200));
  },

  checkAuth: async () => {
    // Mock: no persisted session on reload
    return null;
  },
};

// ---------------------------------------------------------------------------
// Store Types
// ---------------------------------------------------------------------------

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;

  /**
   * The NFID / Internet Identity delegation identity object.
   * Cast to `Identity` from @dfinity/agent at the canister call boundary.
   *
   * ⚠️  NEVER persisted to localStorage.
   */
  identity: unknown | null;

  /** ICP principal as plain text string. Safe to persist. */
  principal: string | null;

  /** Full profile from the canister. Set after login by useAuth hook. */
  profile: UserProfile | null;

  /** Active role for this session. */
  role: UserRole | null;

  /** Unix timestamp (ms). Null until session established. */
  sessionExpiresAt: number | null;

  /** Last auth error. Cleared on next action. */
  error: string | null;

  /** Lit Protocol Auth Signature. Stored upon login for encryption. */
  litAuthSig?: Record<string, string>;

  /**
   * The injected auth provider.
   * ⚠️  NEVER persisted. Replaced at runtime via setAdapter().
   */
  _adapter: AuthAdapter;
}

interface AuthActions {
  /**
   * Trigger the provider login flow.
   * On success: sets identity, principal, sessionExpiresAt, isAuthenticated.
   * On failure: sets error.
   */
  login: () => Promise<void>;

  /**
   * Terminate the session.
   * Clears all auth state and also calls:
   *   - portalStore.resetPortal()
   *   - notificationStore.clearAll()
   */
  logout: () => Promise<void>;

  /**
   * Set the user's profile (called by useAuth hook after canister fetch).
   */
  setProfile: (profile: UserProfile) => void;

  /**
   * Set the user's role (called during first-login role selection page).
   */
  setRole: (role: UserRole) => void;

  /**
   * Returns true if a valid session exists (sessionExpiresAt is in the future).
   */
  checkSession: () => boolean;

  /**
   * Re-establish the session via the adapter's checkAuth().
   * Called on page reload to restore session without re-login.
   */
  refreshSession: () => Promise<void>;

  /**
   * Inject the real auth adapter.
   * Called ONCE from main.tsx when W2's nfid.ts is ready:
   *   useAuthStore.getState().setAdapter(realNfidAdapter)
   */
  setAdapter: (adapter: AuthAdapter) => void;

  /** Store the Lit Protocol signature retrieved during login. */
  setLitAuthSig: (sig: Record<string, string>) => void;

  clearError: () => void;
}

interface AuthComputed {
  /** true when role === 'patient' */
  isPatient: boolean;
  /** true when role === 'doctor' */
  isDoctor: boolean;
  /** true when role === 'admin' */
  isAdmin: boolean;
  /** true when checkSession() returns true */
  isSessionValid: boolean;
}

export type AuthStore = AuthState & AuthActions & AuthComputed;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // --- State ---
      isAuthenticated: false,
      isLoading: false,
      identity: null,
      principal: null,
      profile: null,
      role: null,
      sessionExpiresAt: null,
      error: null,
      _adapter: mockAuthAdapter,

      // --- Computed (eagerly derived from state in each selector call) ---
      get isPatient() {
        return get().role === 'patient';
      },
      get isDoctor() {
        return get().role === 'doctor';
      },
      get isAdmin() {
        return get().role === 'admin';
      },
      get isSessionValid() {
        return get().checkSession();
      },

      // --- Actions ---
      login: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await get()._adapter.login();
          set({
            isAuthenticated: true,
            isLoading: false,
            identity: result.identity,
            principal: result.principal,
            sessionExpiresAt: result.expiresAt,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Login failed';
          set({ isLoading: false, error: message });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await get()._adapter.logout();
        } catch {
          // Logout failure is non-fatal — clear local state regardless
        }

        // Clear cross-store state
        usePortalStore.getState().resetPortal();
        useNotificationStore.getState().clearAll();

        // Clear auth state
        set({
          isAuthenticated: false,
          isLoading: false,
          identity: null,
          principal: null,
          profile: null,
          role: null,
          sessionExpiresAt: null,
          error: null,
        });
      },

      setProfile: (profile) => {
        set({ profile });
      },

      setRole: (role) => {
        set({ role });
      },

      setLitAuthSig: (sig) => {
        set({ litAuthSig: sig });
      },

      checkSession: () => {
        const { sessionExpiresAt } = get();
        if (!sessionExpiresAt) return false;
        return Date.now() < sessionExpiresAt;
      },

      refreshSession: async () => {
        set({ isLoading: true });
        try {
          const result = await get()._adapter.checkAuth();
          if (result) {
            set({
              isAuthenticated: true,
              isLoading: false,
              identity: result.identity,
              principal: result.principal,
              sessionExpiresAt: result.expiresAt,
            });
          } else {
            // No valid session found — treat as logged out
            set({
              isAuthenticated: false,
              isLoading: false,
              identity: null,
            });
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Session check failed';
          set({ isLoading: false, error: message, isAuthenticated: false });
        }
      },

      setAdapter: (adapter) => {
        set({ _adapter: adapter });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'medvault-auth',
      storage: createJSONStorage(() => localStorage),
      // ⚠️  SECURITY: Only persist session metadata — NEVER identity or adapter
      partialize: (state) => ({
        principal: state.principal,
        role: state.role,
        profile: state.profile,
        sessionExpiresAt: state.sessionExpiresAt,
        // isAuthenticated is intentionally NOT persisted:
        // refreshSession() re-validates on every page load
      }),
      // After rehydrating from localStorage, validate the restored session
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Trigger session refresh on app boot — self-initialization
          // This replaces any need for main.tsx to call a bootstrap function
          state.refreshSession().catch(() => {
            // Silent fail — user will see login screen
          });
        }
      },
    }
  )
);

// ---------------------------------------------------------------------------
// Standalone selector helpers (stable references for components)
// ---------------------------------------------------------------------------

/** Use in AuthGuard.tsx and similar gate components. */
export const selectAuthGate = (state: AuthStore) => ({
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
});

/** Use in RoleGuard.tsx. */
export const selectRole = (state: AuthStore) => ({
  role: state.role,
  isPatient: state.isPatient,
  isDoctor: state.isDoctor,
  isAdmin: state.isAdmin,
});

/** Use in ProfileMenu.tsx. */
export const selectProfile = (state: AuthStore) => ({
  profile: state.profile,
  principal: state.principal,
  logout: state.logout,
});

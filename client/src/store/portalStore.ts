// =============================================================================
// MedVault — Portal Store
// Workstream 3: Client State & Integration
//
// Tracks which portal (patient/doctor) is active for the current session.
// Enables dual-role users to switch between patient and doctor views.
//
// Consumed by (Workstream 4):
//   - PortalSwitcher.tsx  — reads activePortal, calls switchPortal()
//   - Header.tsx          — reads activePortal to show correct nav
//   - Sidebar.tsx         — reads activePortal to render correct sidebar links
//   - AppShell.tsx        — reads activePortal for layout decisions
//
// ⚠️  FROZEN PUBLIC API — do not rename these selectors:
//   activePortal, switchPortal, togglePortal
// =============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Portal = 'patient' | 'doctor';

interface PortalState {
  /** The portal currently visible to the user. */
  activePortal: Portal;

  /**
   * The portal the user was in before the most recent switch.
   * Used for back-navigation and undo-style UX.
   * NOT persisted — reset on every page load.
   */
  previousPortal: Portal | null;
}

interface PortalActions {
  /**
   * Switch to a specific portal.
   * Saves the current portal as `previousPortal` before switching.
   */
  switchPortal: (portal: Portal) => void;

  /**
   * Toggle between 'patient' and 'doctor'.
   * Convenience method used by PortalSwitcher toggle button.
   */
  togglePortal: () => void;

  /**
   * Reset to default portal ('patient').
   * Called by authStore.logout() to clean up cross-store state.
   */
  resetPortal: () => void;
}

export type PortalStore = PortalState & PortalActions;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const usePortalStore = create<PortalStore>()(
  persist(
    (set, get) => ({
      // --- State ---
      activePortal: 'patient',
      previousPortal: null,

      // --- Actions ---
      switchPortal: (portal) => {
        const current = get().activePortal;
        // No-op if already on the requested portal
        if (current === portal) return;
        set({ activePortal: portal, previousPortal: current });
      },

      togglePortal: () => {
        const current = get().activePortal;
        const next: Portal = current === 'patient' ? 'doctor' : 'patient';
        set({ activePortal: next, previousPortal: current });
      },

      resetPortal: () => {
        set({ activePortal: 'patient', previousPortal: null });
      },
    }),
    {
      name: 'medvault-portal',
      storage: createJSONStorage(() => localStorage),
      // Only persist activePortal — previousPortal is ephemeral UI state
      partialize: (state) => ({ activePortal: state.activePortal }),
    }
  )
);

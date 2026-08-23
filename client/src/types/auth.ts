// =============================================================================
// MedVault — Auth Types
// Workstream 3: Client State & Integration
//
// These types define the authentication and identity contract for the
// entire client. They are consumed by:
//   - authStore.ts  (Workstream 3)
//   - useAuth.ts    (Workstream 3)
//   - LoginButton, AuthGuard, RoleGuard  (Workstream 4)
//   - nfid.ts, agent.ts  (Workstream 2 — must conform to these shapes)
//
// COORDINATION NOTE:
//   `principal` is stored as a plain string throughout the client (NOT as
//   @dfinity/principal.Principal) so that Zustand's localStorage persistence
//   works without custom serializers. Convert at the canister call boundary.
// =============================================================================

// ---------------------------------------------------------------------------
// Role
// ---------------------------------------------------------------------------

/** Every authenticated user has exactly one active role per session. */
export type UserRole = 'patient' | 'doctor' | 'admin';

// ---------------------------------------------------------------------------
// User Profile
// ---------------------------------------------------------------------------

/**
 * The canonical user record stored on the canister (server/lib/types.ts
 * UserProfile) — represented here as a plain TypeScript interface.
 *
 * Workstream 1 must mirror this shape in Candid.
 */
export interface UserProfile {
  /** UUID — primary key on the canister. */
  id: string;

  /** ICP principal as a text string, e.g. "2vxsx-fae". */
  principal: string;

  role: UserRole;

  displayName: string;

  /** Avatar URL — IPFS CID or data-URI. Optional. */
  avatarUrl?: string;

  // --- Patient-only fields ---
  /** Ayushman Bharat Health Account ID. Only present for patients. */
  abhaId?: string;

  // --- Doctor-only fields ---
  /** Medical council license number. Only present for doctors. */
  licenseNumber?: string;

  /** Hospital / clinic affiliation. Only present for doctors. */
  affiliation?: string;

  /** ISO 8601 timestamp string — canister sets this on first registration. */
  createdAt: string;

  /** ISO 8601 timestamp string — updated on any profile mutation. */
  updatedAt: string;

  // ---------------------------------------------------------------------------
  // ICP-native timestamp fields (Workstream 2 / Workstream 1 coordination)
  // ---------------------------------------------------------------------------
  // ICP canisters (Azle) return timestamps as bigint nanoseconds.
  // W3 convention: store the human-readable ISO string in `createdAt/updatedAt`
  // for UI use, and optionally carry the raw bigint here for W2's actor layer.
  // W2's canister.ts wrapper is responsible for converting bigint → ISO string
  // before populating `createdAt`. These fields are optional and non-breaking.
  // ---------------------------------------------------------------------------

  /**
   * Raw ICP nanosecond timestamp (bigint) — set by the Azle canister.
   * Provided by W2's canister actor wrapper. Optional: only present when
   * the profile was fetched directly from the canister (not from localStorage).
   *
   * ⚠️  Do NOT use this directly in UI components.
   *     Use `createdAt` (ISO string) for display.
   */
  registeredAt?: bigint;

  /**
   * Raw ICP nanosecond timestamp for last update — mirrors `updatedAt`.
   * Optional — only present when fetched fresh from canister.
   */
  lastUpdatedAt?: bigint;
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/**
 * Lightweight session descriptor persisted to localStorage.
 * Does NOT include the delegation chain / identity — those are ephemeral
 * and must be re-established via NFID on every page load.
 */
export interface Session {
  /** ICP principal text string. */
  principal: string;

  role: UserRole;

  /**
   * Unix timestamp (ms) when this session expires.
   * Derived from the NFID delegation expiry.
   */
  expiresAt: number;
}

// ---------------------------------------------------------------------------
// Auth State (shape of authStore)
// ---------------------------------------------------------------------------

export interface LoginOptions {
  provider?: 'nfid' | 'internet_identity';
  customTTL?: bigint;
  onSuccess?: (identity: any) => void;
  onError?: (err: Error) => void;
}

/**
 * The full authentication state managed by Zustand authStore.
 *
 * `identity` is typed `unknown` here so this file has zero dependency on
 * @dfinity/agent. Workstream 2 (nfid.ts / agent.ts) will cast it to
 * `Identity` from @dfinity/agent at the point of use.
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;

  /**
   * The NFID / Internet Identity delegation identity.
   * Type is `unknown` to avoid importing @dfinity/agent in this types file.
   * Cast to `Identity` from @dfinity/agent when passing to HttpAgent.
   *
   * ⚠️  NEVER persisted to localStorage — delegation keys are sensitive.
   */
  identity: unknown | null;

  /** ICP principal as plain text string. Safe to persist. */
  principal: string | null;

  /** Full profile fetched from the canister after login. */
  profile: UserProfile | null;

  /** Active role for the current session. */
  role: UserRole | null;

  /** Unix timestamp (ms). Null until session is established. */
  sessionExpiresAt: number | null;

  /** Last authentication error message, if any. */
  error: string | null;
}

// ---------------------------------------------------------------------------
// Auth Actions (methods on authStore)
// ---------------------------------------------------------------------------

export interface AuthActions {
  /** Trigger NFID login flow. Populates identity + principal on success. */
  login: () => Promise<void>;

  /** Clear all auth state and call NFID logout. */
  logout: () => Promise<void>;

  /** Called after canister profile fetch succeeds post-login. */
  setProfile: (profile: UserProfile) => void;

  /** Called during first-login role selection. */
  setRole: (role: UserRole) => void;

  /** Returns true if sessionExpiresAt is in the future. */
  checkSession: () => boolean;

  /** Re-establishes the NFID delegation if close to expiry. */
  refreshSession: () => Promise<void>;

  clearError: () => void;
}

// ---------------------------------------------------------------------------
// Computed helpers (derived from AuthState)
// ---------------------------------------------------------------------------

export interface AuthComputed {
  isPatient: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
  isSessionValid: boolean;
}

// ---------------------------------------------------------------------------
// Full store type (state + actions + computed)
// ---------------------------------------------------------------------------

export type AuthStore = AuthState & AuthActions & AuthComputed;

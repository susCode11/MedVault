// =============================================================================
// MedVault — useAuth Hook
// Workstream 3: Client State & Integration
//
// The primary auth hook consumed by ALL components that need authentication
// state, profile data, or auth actions.
//
// This hook is the SINGLE interface between the UI and the auth system.
// It orchestrates:
//   1. Auth state from Zustand authStore (login, logout, identity, principal)
//   2. Profile fetching from the canister via TanStack Query
//   3. First-login role selection & profile registration
//   4. ABHA ID linking
//
// Consumed by (Workstream 4):
//   - LoginButton.tsx     — calls login(), reads isLoading, error
//   - AuthGuard.tsx       — reads isAuthenticated, isLoading
//   - RoleGuard.tsx       — reads role, isPatient, isDoctor
//   - ProfileMenu.tsx     — reads profile, principal, calls logout()
//   - AbhaLinkForm.tsx    — calls linkAbha(), reads abhaLinkStatus
//   - RoleSelect.tsx      — calls registerProfile()
//
// ⚠️  IMPORT RULE — do NOT import nfid.ts directly here.
//     Auth state comes from useAuthStore. W2 injects nfid.ts via setAdapter().
//     See authStore.ts AuthAdapter pattern.
//
// ⚠️  MOCK MODE — canister calls are mocked until W2 delivers canister.ts.
//     Toggle MOCK_CANISTER = false once lib/canister.ts is implemented.
// =============================================================================

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { CANISTER_QUERY_KEYS } from './useCanister';
import type { UserProfile, UserRole } from '../types/auth';

// ---------------------------------------------------------------------------
// Mock Canister Flag
// ---------------------------------------------------------------------------

/**
 * Set to false when W2 delivers lib/canister.ts and it exports:
 *   registerUser, getMyProfile, updateUser
 *
 * When false, uncomment the real import lines below and remove mock functions.
 */
const MOCK_CANISTER = true;

// ---------------------------------------------------------------------------
// Real canister imports (uncomment when W2 delivers lib/canister.ts)
// ---------------------------------------------------------------------------
// import { registerUser, getMyProfile, updateUser } from '../lib/canister';

// ---------------------------------------------------------------------------
// Mock canister functions (used until W2 delivers lib/canister.ts)
// ---------------------------------------------------------------------------

/** Simulates fetching the user profile from the canister. */
const mockGetMyProfile = async (principal: string): Promise<UserProfile> => {
  await new Promise((r) => setTimeout(r, 600));
  return {
    id: `profile-${principal}`,
    principal,
    role: 'patient',
    displayName: 'Mock Patient',
    avatarUrl: undefined,
    abhaId: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/** Simulates registering a new user profile on the canister (first login). */
const mockRegisterUser = async (
  principal: string,
  role: UserRole,
  displayName: string,
  opts?: { abhaId?: string; licenseNumber?: string; affiliation?: string }
): Promise<UserProfile> => {
  await new Promise((r) => setTimeout(r, 800));
  return {
    id: `profile-${principal}`,
    principal,
    role,
    displayName,
    abhaId: opts?.abhaId,
    licenseNumber: opts?.licenseNumber,
    affiliation: opts?.affiliation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/** Simulates updating the user profile on the canister. */
const mockUpdateUser = async (
  _principal: string,
  update: Partial<UserProfile>
): Promise<UserProfile> => {
  await new Promise((r) => setTimeout(r, 500));
  // In mock mode, return the update merged with a base profile
  return {
    id: `profile-${_principal}`,
    principal: _principal,
    role: 'patient',
    displayName: 'Mock Patient',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...update,
  };
};

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

// Removed AUTH_QUERY_KEYS, use CANISTER_QUERY_KEYS.users instead.

// ---------------------------------------------------------------------------
// Register Profile Input
// ---------------------------------------------------------------------------

export interface RegisterProfileInput {
  role: UserRole;
  displayName: string;
  /** Patient only */
  abhaId?: string;
  /** Doctor only */
  licenseNumber?: string;
  /** Doctor only */
  affiliation?: string;
}

// ---------------------------------------------------------------------------
// useAuth Hook
// ---------------------------------------------------------------------------

/**
 * Primary authentication hook. Use this everywhere you need auth state,
 * user profile, or auth actions.
 *
 * @example
 * ```tsx
 * const { isAuthenticated, profile, login, logout, isPatient } = useAuth();
 * ```
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // --- Read auth state from Zustand store ---
  const isAuthenticated  = useAuthStore((s) => s.isAuthenticated);
  const isLoading        = useAuthStore((s) => s.isLoading);
  const principal        = useAuthStore((s) => s.principal);
  const profile          = useAuthStore((s) => s.profile);
  const role             = useAuthStore((s) => s.role);
  const error            = useAuthStore((s) => s.error);
  const isPatient        = useAuthStore((s) => s.isPatient);
  const isDoctor         = useAuthStore((s) => s.isDoctor);
  const isAdmin          = useAuthStore((s) => s.isAdmin);
  const isSessionValid   = useAuthStore((s) => s.isSessionValid);

  // --- Read auth actions from Zustand store ---
  const storeLogin       = useAuthStore((s) => s.login);
  const storeLogout      = useAuthStore((s) => s.logout);
  const setProfile       = useAuthStore((s) => s.setProfile);
  const setRole          = useAuthStore((s) => s.setRole);
  const clearError       = useAuthStore((s) => s.clearError);

  // ---------------------------------------------------------------------------
  // Profile Query
  // ---------------------------------------------------------------------------

  /**
   * Fetches the user's profile from the canister after login.
   * Only runs when:
   *   - The user is authenticated (has a principal)
   *   - The profile hasn't been loaded yet
   *
   * On success: updates authStore.profile via setProfile().
   * staleTime: Infinity — profile does not change mid-session.
   */
  const profileQuery = useQuery({
    queryKey: CANISTER_QUERY_KEYS.users.byPrincipal(principal ?? ''),
    queryFn: async () => {
      const fetch = MOCK_CANISTER
        ? mockGetMyProfile
        : (p: string) => import('../lib/canister').then((m) => m.getMyProfile(p));

      const data = await (MOCK_CANISTER
        ? mockGetMyProfile(principal!)
        : (await import('../lib/canister')).getMyProfile(principal!));

      // Write fetched profile into the auth store
      setProfile(data);
      return data;
    },
    // Only run this query when authenticated, has a principal, and no profile yet
    enabled: isAuthenticated && !!principal && !profile,
    staleTime: Infinity,
    retry: 2,
  });

  // ---------------------------------------------------------------------------
  // Register Profile Mutation (first-time login)
  // ---------------------------------------------------------------------------

  /**
   * Creates the user's profile on the canister for the first time.
   * Called from the RoleSelect page after the user picks patient/doctor.
   *
   * On success:
   *   1. Writes profile to authStore
   *   2. Sets role in authStore
   *   3. Invalidates the profile query (so it refreshes from canister)
   */
  const registerProfileMutation = useMutation({
    mutationFn: async (input: RegisterProfileInput) => {
      if (!principal) throw new Error('No principal — not authenticated');

      const result = MOCK_CANISTER
        ? await mockRegisterUser(principal, input.role, input.displayName, {
            abhaId:        input.abhaId,
            licenseNumber: input.licenseNumber,
            affiliation:   input.affiliation,
          })
        : await (await import('../lib/canister')).registerUser(
            input.role,
            input.displayName,
            input.abhaId,
            input.licenseNumber,
            input.affiliation
          );

      return result;
    },
    onSuccess: (data) => {
      setProfile(data);
      setRole(data.role);
      queryClient.setQueryData(CANISTER_QUERY_KEYS.users.byPrincipal(data.principal), data);
    },
  });

  // ---------------------------------------------------------------------------
  // Link ABHA ID Mutation
  // ---------------------------------------------------------------------------

  /**
   * Links an ABHA (Ayushman Bharat Health Account) ID to the patient's profile.
   * Called from AbhaLinkForm after OTP verification succeeds.
   */
  const linkAbhaMutation = useMutation({
    mutationFn: async (abhaId: string) => {
      if (!principal) throw new Error('No principal — not authenticated');

      const result = MOCK_CANISTER
        ? await mockUpdateUser(principal, { abhaId })
        : await (await import('../lib/canister')).updateUser({ abhaId });

      return result;
    },
    onSuccess: (data) => {
      setProfile(data);
      queryClient.setQueryData(CANISTER_QUERY_KEYS.users.byPrincipal(data.principal), data);
    },
  });

  // ---------------------------------------------------------------------------
  // ABHA link status (derived from profile)
  // ---------------------------------------------------------------------------

  const abhaLinkStatus = profile?.abhaId ? 'linked' : 'unlinked';

  // ---------------------------------------------------------------------------
  // Stable action wrappers
  // ---------------------------------------------------------------------------

  /** Trigger NFID login via authStore (which delegates to the injected adapter). */
  const login = useCallback(async () => {
    clearError();
    await storeLogin();
  }, [storeLogin, clearError]);

  /** Logout and clear all state. */
  const logout = useCallback(async () => {
    await storeLogout();
    // Invalidate profile query so it doesn't linger in cache
    queryClient.removeQueries({ queryKey: ['users'] });
  }, [storeLogout, queryClient]);

  /** Register a profile on first login. */
  const registerProfile = useCallback(
    (input: RegisterProfileInput) => registerProfileMutation.mutateAsync(input),
    [registerProfileMutation]
  );

  /** Link ABHA ID to patient profile. */
  const linkAbha = useCallback(
    (abhaId: string) => linkAbhaMutation.mutateAsync(abhaId),
    [linkAbhaMutation]
  );

  // ---------------------------------------------------------------------------
  // Return
  // ---------------------------------------------------------------------------

  return {
    // --- Auth state (from store) ---
    isAuthenticated,
    isLoading,
    principal,
    profile,
    role,
    error,
    isPatient,
    isDoctor,
    isAdmin,
    isSessionValid,

    // --- ABHA ---
    abhaLinkStatus,

    // --- Profile query (TanStack Query) ---
    profileQuery,
    isProfileLoading: profileQuery.isLoading,
    isProfileError:   profileQuery.isError,
    profileError:     profileQuery.error,

    // --- Registration mutation ---
    registerProfile,
    isRegistering:     registerProfileMutation.isPending,
    registrationError: registerProfileMutation.error,

    // --- ABHA mutation ---
    linkAbha,
    isLinkingAbha:  linkAbhaMutation.isPending,
    abhaLinkError:  linkAbhaMutation.error,

    // --- Auth actions ---
    login,
    logout,
    setRole,
    clearError,
  };
}

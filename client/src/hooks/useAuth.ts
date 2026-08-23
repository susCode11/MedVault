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
import { CANISTER_QUERY_KEYS, useCanisterActor } from './useCanister';
import type { UserRole } from '../types/auth';

// ---------------------------------------------------------------------------
// Real canister imports (uncomment when W2 delivers lib/canister.ts)
// ---------------------------------------------------------------------------
// import { registerUser, getMyProfile, updateUser } from '../lib/canister';

// Removed mock canister functions as W2 delivered lib/canister.ts

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
  const { actor, isReady } = useCanisterActor();

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
      if (!actor) throw new Error("Actor not ready");
      const res = await (actor as any).getProfile();
      if ('error' in res) throw new Error(res.error.message);
      const profile = res.ok.length > 0 ? res.ok[0] : null;
      if (!profile) {
        setProfile(null as any);
        setRole(null as any);
        return null;
      }
      
      const serializedProfile = {
        ...profile,
        displayName: profile.name, // Map backend 'name' to frontend 'displayName'
        createdAt: typeof profile.createdAt === 'bigint' ? new Date(Number(profile.createdAt) / 1000000).toISOString() : profile.createdAt,
        updatedAt: typeof profile.updatedAt === 'bigint' ? new Date(Number(profile.updatedAt) / 1000000).toISOString() : profile.updatedAt,
      };
      
      setProfile(serializedProfile);
      setRole(serializedProfile.role);
      return serializedProfile;
    },
    // Only run this query when authenticated, has a principal, and no profile yet
    enabled: isAuthenticated && !!principal && !profile && isReady,
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
      if (!principal || !actor) throw new Error('Not authenticated');

      // The backend expects (name, role, abhaId) as positional arguments
      const res = await (actor as any).registerUser(
        input.displayName || principal.toString(),
        input.role,
        input.abhaId || ""
      );
      if ('error' in res) throw new Error(res.error.message);
      
      const profile = res.ok;
      return {
        ...profile,
        displayName: profile.name,
        createdAt: typeof profile.createdAt === 'bigint' ? new Date(Number(profile.createdAt) / 1000000).toISOString() : profile.createdAt,
        updatedAt: typeof profile.updatedAt === 'bigint' ? new Date(Number(profile.updatedAt) / 1000000).toISOString() : profile.updatedAt,
      };
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
      if (!principal || !actor) throw new Error('Not authenticated');

      const res = await (actor as any).linkAbhaId(abhaId);
      if ('error' in res) throw new Error(res.error.message);
      
      const profile = res.ok;
      return {
        ...profile,
        displayName: profile.name,
        createdAt: typeof profile.createdAt === 'bigint' ? new Date(Number(profile.createdAt) / 1000000).toISOString() : profile.createdAt,
        updatedAt: typeof profile.updatedAt === 'bigint' ? new Date(Number(profile.updatedAt) / 1000000).toISOString() : profile.updatedAt,
      };
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

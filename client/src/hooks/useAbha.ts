// =============================================================================
// MedVault — useAbha Hook
// Workstream 3: Client State & Integration
// Phase 4c
//
// Hooks for ABHA (Ayushman Bharat Health Account) operations:
//   - Verify an ABHA ID (patient self-link flow)
//   - Look up a patient by ABHA ID (doctor portal search)
//   - Link ABHA ID to the patient's profile
//
// Consumed by (Workstream 4):
//   - AbhaLinkForm.tsx    — patient links their ABHA ID (verify + link)
//   - PatientLookup.tsx   — doctor searches for a patient by ABHA ID
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCanisterActor, CANISTER_QUERY_KEYS } from './useCanister';
import { useAuthStore } from '../store/authStore';
import type { AbhaVerificationResult, AbhaSearchResult } from '../types/abha';

// ---------------------------------------------------------------------------
// useVerifyAbha
// ---------------------------------------------------------------------------

/**
 * Verify an ABHA ID against the registry.
 * Runs on demand — not enabled by default.
 *
 * Usage:
 *   const { verifyAbha, isVerifying, verificationResult } = useVerifyAbha();
 *   await verifyAbha('12345678901234');
 */
export function useVerifyAbha() {
  const { actor } = useCanisterActor();

  const mutation = useMutation({
    mutationFn: async (abhaId: string): Promise<AbhaVerificationResult> => {
      // Mock verification for demo purposes (no backend endpoint yet)
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        isValid:       true,
        abhaId:        abhaId.replace(/-/g, ''),
        patientName:   "Mock Verified Patient",
        errorMessage:  "",
        verifiedAt:    new Date().toISOString(),
      };
    },
  });

  return {
    verifyAbha:         mutation.mutateAsync,
    isVerifying:        mutation.isPending,
    verificationResult: mutation.data ?? null,
    verifyError:        mutation.error,
    resetVerification:  mutation.reset,
  };
}

// ---------------------------------------------------------------------------
// useLookupPatient
// ---------------------------------------------------------------------------

/**
 * Doctor portal: look up a patient by ABHA ID.
 * Returns patient demographics + whether the doctor already has access.
 *
 * Usage:
 *   const { lookupPatient, isLooking, searchResult } = useLookupPatient();
 *   await lookupPatient('12345678901234');
 */
export function useLookupPatient() {
  const { actor } = useCanisterActor();

  const mutation = useMutation({
    mutationFn: async (abhaId: string): Promise<AbhaSearchResult> => {
      const res = await (actor as any).lookupPatientByAbha(abhaId.replace(/-/g, ''));
      if ('error' in res) throw new Error(res.error.message);

      const optUser = res.ok;
      if (optUser.length === 0) {
        throw new Error("Patient not found");
      }
      
      const entry = optUser[0];

      // Fetch real grants to check access
      const grantsRes = await (actor as any).listMyGrants();
      const grants = ('ok' in grantsRes) ? grantsRes.ok : [];
      
      const hasExistingAccess = grants.some((g: any) => 
        g.patientPrincipal === entry.principal && 
        g.revokedAt.length === 0 && 
        g.status === 'approved'
      );
      const hasPendingRequest = grants.some((g: any) => 
        g.patientPrincipal === entry.principal && 
        g.revokedAt.length === 0 && 
        g.status === 'pending'
      );

      const result: AbhaSearchResult = {
        patient: {
          abhaId:             entry.abhaId,
          name:               entry.name,
          dateOfBirth:        '1990-01-01', // Real ABHA API would return this
          gender:             'other',      // Real ABHA API would return this
          medvaultPrincipal:  entry.principal,
          hasMedvaultProfile: !!entry.principal,
          state:              'Unknown',    // Real ABHA API would return this
        },
        hasExistingAccess,
        hasPendingRequest,
      };
      return result;
    },
  });

  // Prefetch query variant (for URL-based lookup, e.g. /doctor/patients?abha=...)
  const prefetchQuery = useQuery({
    queryKey: CANISTER_QUERY_KEYS.abha.lookup(''),
    queryFn: async () => null,
    enabled: false,  // Never auto-runs — only used for cache population
  });
  void prefetchQuery;

  return {
    lookupPatient: mutation.mutateAsync,
    isLooking:     mutation.isPending,
    searchResult:  mutation.data ?? null,
    lookupError:   mutation.error,
    resetLookup:   mutation.reset,
  };
}

// ---------------------------------------------------------------------------
// useLinkAbha
// ---------------------------------------------------------------------------

/**
 * Link a verified ABHA ID to the logged-in patient's profile.
 * Called after successful OTP verification.
 */
export function useLinkAbha() {
  const { actor } = useCanisterActor();
  const queryClient = useQueryClient();
  const principal = useAuthStore((s) => s.principal);
  const setProfile = useAuthStore((s) => s.setProfile);

  const mutation = useMutation({
    mutationFn: async (abhaId: string) => {
      if (!principal) throw new Error('Not authenticated');
      const res = await (actor as any).linkAbhaId(abhaId);
      if ('error' in res) throw new Error(res.error.message);
      return res.ok;
    },
    onSuccess: (data) => {
      setProfile(data);
      queryClient.setQueryData(
        CANISTER_QUERY_KEYS.users.byPrincipal(data.principal),
        data
      );
    },
  });

  return {
    linkAbha:       mutation.mutateAsync,
    isLinking:      mutation.isPending,
    isLinked:       mutation.isSuccess,
    linkError:      mutation.error,
  };
}

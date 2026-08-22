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
      const res = await actor.verifyAbhaId(abhaId.replace(/-/g, ''));
      if (!res.ok) throw new Error(res.error.message);
      return {
        isValid:       res.data.isValid,
        abhaId:        abhaId.replace(/-/g, ''),
        patientName:   res.data.name,
        errorMessage:  res.data.errorMessage,
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
      const res = await actor.lookupPatientByAbha(abhaId.replace(/-/g, ''));
      if (!res.ok) throw new Error(res.error.message);

      const entry = res.data;

      // Check existing access (simplified — real version queries grants)
      const hasExistingAccess = false;  // Placeholder — real: check grant store
      const hasPendingRequest = false;  // Placeholder — real: check pending grants

      const result: AbhaSearchResult = {
        patient: {
          abhaId:             entry.abhaId,
          name:               entry.name,
          dateOfBirth:        entry.dob,
          gender:             entry.gender,
          medvaultPrincipal:  entry.principal,
          hasMedvaultProfile: entry.principal !== null,
          state:              entry.state,
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
      const res = await actor.updateUser({ principal, abhaId });
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
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

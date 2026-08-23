// =============================================================================
// MedVault — useAccess Hook
// Workstream 3: Client State & Integration
// Phase 4d
//
// All access grant operations:
//   - useAccessGrants    — list grants for the logged-in user (patient or doctor)
//   - useAccessRequest   — doctor submits a new access request
//   - useGrantActions    — patient approves / denies / revokes a grant
//   - useConsentTimeline — ordered audit trail for a single grant
//
// Consumed by (Workstream 4):
//   - AccessRequestCard.tsx   — useAccessGrants (patient: incoming requests)
//   - LinkedProviders.tsx     — useAccessGrants (patient: approved grants)
//   - DoctorPatients.tsx      — useAccessGrants (doctor: their requests)
//   - RequestAccessModal.tsx  — useAccessRequest
//   - AccessGrantModal.tsx    — useGrantActions
//   - ConsentTimeline.tsx     — useConsentTimeline
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCanisterActor, CANISTER_QUERY_KEYS } from './useCanister';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import type { AccessRequest, AccessApprovalPayload, AccessDenialPayload, AccessStatus, AccessGrant } from '../types/access';

// ---------------------------------------------------------------------------
// useAccessGrants
// ---------------------------------------------------------------------------

/**
 * List access grants for the current user.
 * Returns all grants when no filter is applied.
 *
 * Usage (patient, seeing incoming doctor requests):
 *   const { grants, isLoading } = useAccessGrants({ statusFilter: 'pending' });
 *
 * Usage (doctor, seeing their outgoing requests):
 *   const { grants } = useAccessGrants();
 */
export function useAccessGrants(options?: { statusFilter?: AccessStatus | 'all' }) {
  const { actor, isReady } = useCanisterActor();
  const principal = useAuthStore((s) => s.principal);
  const role      = useAuthStore((s) => s.role);

  const callerId = principal ?? '';
  const callerRole = (role === 'patient' || role === 'doctor') ? role : 'patient';

  const query = useQuery({
    queryKey: CANISTER_QUERY_KEYS.access.list(callerRole, callerId),
    queryFn: async () => {
      const res = await (actor as any).listMyGrants();
      if ('error' in res) throw new Error(res.error.message);
      return res.ok;
    },
    enabled: isReady && !!principal && !!role,
    staleTime: 15_000,
  });

  // Apply optional client-side status filter
  const grants = (query.data ?? []).filter((g: AccessGrant) => {
    if (!options?.statusFilter || options.statusFilter === 'all') return true;
    return g.status === options.statusFilter;
  });

  // Convenience groupings for patient dashboard
  const pendingGrants  = grants.filter((g: AccessGrant) => g.status === 'pending');
  const approvedGrants = grants.filter((g: AccessGrant) => g.status === 'approved');
  const revokedGrants  = grants.filter((g: AccessGrant) => g.status === 'revoked');

  return {
    grants,
    pendingGrants,
    approvedGrants,
    revokedGrants,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error,
    refetch:   query.refetch,
  };
}

// ---------------------------------------------------------------------------
// useAccessRequest
// ---------------------------------------------------------------------------

/**
 * Doctor submits an access request to a patient.
 * Creates a pending grant on the canister.
 *
 * Usage:
 *   const { requestAccess, isRequesting } = useAccessRequest();
 *   await requestAccess({ patientId, recordIds, reason, requestedDurationHours: 72 });
 */
export function useAccessRequest() {
  const { actor }   = useCanisterActor();
  const queryClient = useQueryClient();
  const principal   = useAuthStore((s) => s.principal);
  const profile     = useAuthStore((s) => s.profile);
  const { success, error: notifyError } = useNotificationStore();

  const mutation = useMutation({
    mutationFn: async (payload: AccessRequest) => {
      if (!principal || !profile) throw new Error('Not authenticated');

      const res = await (actor as any).requestAccess({
        ...payload,
        doctorId:    principal,
        doctorName:  profile.displayName,
        patientName: 'Patient', // Real: fetch from ABHA lookup or canister
      });
      if ('error' in res) throw new Error(res.error.message);
      return res.ok;
    },
    onSuccess: (grant) => {
      // Invalidate the doctor's grant list
      queryClient.invalidateQueries({ queryKey: CANISTER_QUERY_KEYS.access.lists() });
      success(
        'Access requested',
        `Your request has been sent to ${grant.patientName}. You'll be notified when they respond.`
      );
    },
    onError: (err) => {
      notifyError('Request failed', err instanceof Error ? err.message : 'Access request failed');
    },
  });

  return {
    requestAccess: mutation.mutateAsync,
    isRequesting:  mutation.isPending,
    requestError:  mutation.error,
  };
}

// ---------------------------------------------------------------------------
// useGrantActions (patient: approve / deny / revoke)
// ---------------------------------------------------------------------------

/**
 * Patient actions on access grants.
 *
 * Usage:
 *   const { approveGrant, denyGrant, revokeGrant } = useGrantActions();
 *   await approveGrant({ grantId: 'grant-002', expiresAt: '2024-12-31T00:00:00Z' });
 */
export function useGrantActions() {
  const { actor }   = useCanisterActor();
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotificationStore();

  const invalidateGrants = () =>
    queryClient.invalidateQueries({ queryKey: CANISTER_QUERY_KEYS.access.lists() });

  const approveMutation = useMutation({
    mutationFn: async (payload: AccessApprovalPayload) => {
      const res = await (actor as any).approveGrant(payload);
      if ('error' in res) throw new Error(res.error.message);
      return res.ok;
    },
    onSuccess: (grant) => {
      invalidateGrants();
      success('Access approved', `Dr. ${grant.doctorName} now has access to your records.`);
    },
    onError: (err) => {
      notifyError('Approval failed', err instanceof Error ? err.message : 'Could not approve access');
    },
  });

  const denyMutation = useMutation({
    mutationFn: async (payload: AccessDenialPayload) => {
      const res = await (actor as any).denyGrant(payload);
      if ('error' in res) throw new Error(res.error.message);
      return res.ok;
    },
    onSuccess: () => {
      invalidateGrants();
      success('Access denied', 'The access request has been declined.');
    },
    onError: (err) => {
      notifyError('Denial failed', err instanceof Error ? err.message : 'Could not deny access');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (payload: AccessDenialPayload) => {
      const res = await (actor as any).revokeGrant(payload);
      if ('error' in res) throw new Error(res.error.message);
      return res.ok;
    },
    onSuccess: (grant) => {
      invalidateGrants();
      success('Access revoked', `Dr. ${grant.doctorName}'s access has been revoked.`);
    },
    onError: (err) => {
      notifyError('Revocation failed', err instanceof Error ? err.message : 'Could not revoke access');
    },
  });

  return {
    approveGrant:    approveMutation.mutateAsync,
    denyGrant:       denyMutation.mutateAsync,
    revokeGrant:     revokeMutation.mutateAsync,
    isApproving:     approveMutation.isPending,
    isDenying:       denyMutation.isPending,
    isRevoking:      revokeMutation.isPending,
    approveError:    approveMutation.error,
    denyError:       denyMutation.error,
    revokeError:     revokeMutation.error,
  };
}

// ---------------------------------------------------------------------------
// useConsentTimeline
// ---------------------------------------------------------------------------

/**
 * Fetch the ordered audit trail for a single access grant.
 * Used by ConsentTimeline.tsx to render the event history.
 *
 * Usage:
 *   const { events, isLoading } = useConsentTimeline('grant-001');
 */
export function useConsentTimeline(grantId: string | null) {
  const { actor, isReady } = useCanisterActor();

  const query = useQuery({
    queryKey: CANISTER_QUERY_KEYS.access.timeline(grantId ?? ''),
    queryFn: async () => {
      const res = await (actor as any).getConsentTimeline(grantId!);
      if ('error' in res) throw new Error(res.error.message);
      return res.ok;
    },
    enabled: isReady && !!grantId,
    staleTime: 30_000,
  });

  return {
    events:    query.data ?? [],
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error,
  };
}

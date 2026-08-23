// =============================================================================
// MedVault — useReport Hook
// Workstream 3: Client State & Integration
// Phase 4d
//
// Abuse reporting operations:
//   - useSubmitAbuseReport — patient submits a report against an emergency access
//   - useAbuseReports      — (admin only) list all submitted reports
//
// Consumed by (Workstream 4):
//   - ReportAbuseModal.tsx — useSubmitAbuseReport
//   - AdminDashboard.tsx   — useAbuseReports
// =============================================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCanisterActor, CANISTER_QUERY_KEYS } from './useCanister';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import type { AbuseReportPayload } from '../types/emergency';

// ---------------------------------------------------------------------------
// useSubmitAbuseReport
// ---------------------------------------------------------------------------

/**
 * Patient submits an abuse report against a specific emergency access event.
 *
 * Usage:
 *   const { submitReport, isSubmitting } = useSubmitAbuseReport();
 *   await submitReport({
 *     emergencyEventId: 'emergency-001',
 *     description: 'This was not a real emergency...',
 *   });
 */
export function useSubmitAbuseReport() {
  const { actor }   = useCanisterActor();
  const queryClient = useQueryClient();
  const principal   = useAuthStore((s) => s.principal);
  const { success, error: notifyError } = useNotificationStore();

  const mutation = useMutation({
    mutationFn: async (payload: AbuseReportPayload) => {
      if (!principal) throw new Error('Not authenticated');

      const res = await (actor as any).submitAbuseReport({
        ...payload,
        reporterId: principal,
      });
      if ('error' in res) throw new Error(res.error.message);
      return res.ok;
    },
    onSuccess: () => {
      // Invalidate both reports and emergency lists, as the emergency
      // event's status changes to 'reported'
      queryClient.invalidateQueries({ queryKey: CANISTER_QUERY_KEYS.reports.lists() });
      queryClient.invalidateQueries({ queryKey: CANISTER_QUERY_KEYS.emergency.lists() });
      success('Report submitted', 'Your report has been sent to the administration for review.');
    },
    onError: (err) => {
      notifyError('Failed to submit report', err instanceof Error ? err.message : 'Could not submit the report');
    },
  });

  return {
    submitReport: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    reportError:  mutation.error,
  };
}

// ---------------------------------------------------------------------------
// useAbuseReports (Admin)
// ---------------------------------------------------------------------------

/**
 * Fetch all abuse reports. Typically restricted to admin users.
 *
 * Usage:
 *   const { reports, isLoading } = useAbuseReports();
 */
export function useAbuseReports() {
  const { actor, isReady } = useCanisterActor();
  const isAdmin = useAuthStore((s) => s.isAdmin);

  const query = useQuery({
    queryKey: CANISTER_QUERY_KEYS.reports.lists(),
    queryFn: async () => {
      const res = await (actor as any).listAbuseReports({
        page: 1,
        pageSize: 50,
      });
      if ('error' in res) throw new Error(res.error.message);
      return res.ok?.items;
    },
    enabled: isReady && isAdmin,
    staleTime: 60_000,
  });

  return {
    reports:   query.data ?? [],
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error,
    refetch:   query.refetch,
  };
}

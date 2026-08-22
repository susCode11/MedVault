// =============================================================================
// MedVault — useEmergency Hook
// Workstream 3: Client State & Integration
// Phase 4d
//
// All emergency (break-glass) access operations:
//   - useEmergencyEvents   — list events for the logged-in user
//   - useTriggerEmergency  — doctor invokes break-glass access
//   - useAcknowledgeEmergency — patient acknowledges an emergency event
//
// On a new emergency event (patient side):
//   1. List query is invalidated and refetches
//   2. notificationStore.showEmergencyBanner() is called automatically
//      → The persistent banner in AppShell renders immediately
//   3. Patient sees the "Acknowledge" CTA
//
// Consumed by (Workstream 4):
//   - EmergencyAuditLog.tsx   — useEmergencyEvents
//   - BreakGlassButton.tsx    — useTriggerEmergency
//   - EmergencyBanner.tsx     — reads notificationStore.emergencyBanner
//   - EmergencyForm.tsx       — useTriggerEmergency with form state
// =============================================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCanisterActor, CANISTER_QUERY_KEYS } from './useCanister';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import type { EmergencyAccessPayload } from '../types/emergency';

// ---------------------------------------------------------------------------
// useEmergencyEvents
// ---------------------------------------------------------------------------

/**
 * List emergency access events for the current user.
 *
 * Patient sees: events where they are the patient (someone accessed their records).
 * Doctor sees:  events where they triggered break-glass access.
 *
 * Usage:
 *   const { events, isLoading } = useEmergencyEvents();
 */
export function useEmergencyEvents() {
  const { actor, isReady } = useCanisterActor();
  const principal = useAuthStore((s) => s.principal);
  const role      = useAuthStore((s) => s.role);
  const showEmergencyBanner = useNotificationStore((s) => s.showEmergencyBanner);

  const callerRole = (role === 'patient' || role === 'doctor') ? role : 'patient';
  const callerId   = principal ?? '';

  const query = useQuery({
    queryKey: CANISTER_QUERY_KEYS.emergency.list(callerRole, callerId),
    queryFn: async () => {
      const res = await actor.listEmergencyEvents({
        role:     callerRole,
        callerId,
        pageSize: 50,
        page:     1,
      });
      if (!res.ok) throw new Error(res.error.message);
      return res.data.items;
    },
    enabled: isReady && !!principal && !!role,
    staleTime: 10_000,
    // When patient gets new active events, surface the emergency banner
    select: (events) => {
      if (callerRole === 'patient') {
        const activeEvents = events.filter((e) => e.status === 'active');
        if (activeEvents.length > 0) {
          const latest = activeEvents[0];
          showEmergencyBanner({
            eventId:          latest.id,
            doctorName:       latest.doctorName,
            doctorAffiliation: latest.doctorAffiliation,
            reason:           latest.reason,
            triggeredAt:      latest.createdAt,
            recordCount:      latest.recordsAccessed.length,
          });
        }
      }
      return events;
    },
  });

  const events = query.data ?? [];

  return {
    events,
    activeEvents:       events.filter((e) => e.status === 'active'),
    acknowledgedEvents: events.filter((e) => e.status === 'acknowledged'),
    reportedEvents:     events.filter((e) => e.status === 'reported'),
    totalCount:         events.length,
    isLoading:          query.isLoading,
    isError:            query.isError,
    error:              query.error,
    refetch:            query.refetch,
  };
}

// ---------------------------------------------------------------------------
// useTriggerEmergency
// ---------------------------------------------------------------------------

/**
 * Doctor triggers break-glass emergency access to a patient's records.
 * Creates an EmergencyAccessEvent with status 'active'.
 * The patient is notified via real-time banner (via query invalidation + select).
 *
 * Usage:
 *   const { triggerEmergency, isTriggering } = useTriggerEmergency();
 *   await triggerEmergency({
 *     patientId: 'mock-patient-001-...',
 *     reason: 'unconscious_patient',
 *     justification: 'Patient arrived unconscious...',
 *   });
 */
export function useTriggerEmergency() {
  const { actor }   = useCanisterActor();
  const queryClient = useQueryClient();
  const principal   = useAuthStore((s) => s.principal);
  const profile     = useAuthStore((s) => s.profile);
  const { success, error: notifyError } = useNotificationStore();

  const mutation = useMutation({
    mutationFn: async (payload: EmergencyAccessPayload) => {
      if (!principal || !profile) throw new Error('Not authenticated');

      const res = await actor.triggerEmergency({
        ...payload,
        doctorId:          principal,
        doctorName:        profile.displayName,
        doctorAffiliation: profile.affiliation ?? 'Unknown Institution',
        patientName:       'Patient', // Real: resolve from ABHA lookup
      });
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: (event) => {
      // Invalidate both doctor and patient emergency event lists
      queryClient.invalidateQueries({ queryKey: CANISTER_QUERY_KEYS.emergency.lists() });
      success(
        'Emergency access activated',
        `Break-glass access to ${event.patientName}'s records is now active. This action has been logged.`
      );
    },
    onError: (err) => {
      notifyError('Emergency access failed', err instanceof Error ? err.message : 'Could not activate emergency access');
    },
  });

  return {
    triggerEmergency: mutation.mutateAsync,
    isTriggering:     mutation.isPending,
    triggerError:     mutation.error,
    lastEvent:        mutation.data ?? null,
  };
}

// ---------------------------------------------------------------------------
// useAcknowledgeEmergency
// ---------------------------------------------------------------------------

/**
 * Patient acknowledges they have seen an emergency access event.
 * Changes status from 'active' → 'acknowledged'.
 * Dismisses the emergency banner.
 *
 * Usage:
 *   const { acknowledgeEmergency, isAcknowledging } = useAcknowledgeEmergency();
 *   await acknowledgeEmergency('emergency-003');
 */
export function useAcknowledgeEmergency() {
  const { actor }   = useCanisterActor();
  const queryClient = useQueryClient();
  const principal   = useAuthStore((s) => s.principal);
  const role        = useAuthStore((s) => s.role);
  const dismissEmergencyBanner = useNotificationStore((s) => s.dismissEmergencyBanner);
  const { success, error: notifyError } = useNotificationStore();

  const mutation = useMutation({
    mutationFn: async (eventId: string) => {
      const res = await actor.acknowledgeEmergency(eventId);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    onSuccess: () => {
      dismissEmergencyBanner();
      const callerId = principal ?? '';
      const callerRole = role === 'patient' ? 'patient' : 'doctor';
      queryClient.invalidateQueries({
        queryKey: CANISTER_QUERY_KEYS.emergency.list(callerRole, callerId),
      });
      success('Acknowledged', 'You have acknowledged the emergency access. You can report this if needed.');
    },
    onError: (err) => {
      notifyError('Acknowledgement failed', err instanceof Error ? err.message : 'Could not acknowledge event');
    },
  });

  return {
    acknowledgeEmergency: mutation.mutateAsync,
    isAcknowledging:      mutation.isPending,
    acknowledgeError:     mutation.error,
  };
}

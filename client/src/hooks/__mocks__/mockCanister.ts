// =============================================================================
// MedVault — Mock Canister Service
// Workstream 3: Client State & Integration
// Phase 3: Mock Layer
//
// A full in-memory implementation of the MedVaultCanister interface
// (defined in types/canister.ts). Every hook imports from here during
// development. Swapping to the real canister requires changing ONE import
// line in useCanister.ts.
//
// DESIGN:
//   - Each method mirrors the real canister signature exactly
//   - Simulates 200–800ms latency (configurable via MOCK_LATENCY_MS)
//   - Operates on in-memory Maps seeded from mockData.ts
//   - Full CRUD — mutations persist within the browser session
//   - Returns CanisterResponse<T> discriminated union on every call
//   - Error scenarios triggerable via MOCK_ERROR_OVERRIDES map
//
// WHEN TO REMOVE:
//   Never remove this file. Toggle it off via useCanister.ts flag.
//   Keep for unit tests and Storybook stories.
// =============================================================================

import type { CanisterResponse, PaginatedResponse, QueryParams } from '../../types/canister';
import type { UserProfile } from '../../types/auth';
import type { MedicalRecord, RecordMetadata } from '../../types/records';
import type { AccessGrant, ConsentEvent, AccessRequest, AccessApprovalPayload, AccessDenialPayload } from '../../types/access';
import type { EmergencyAccessEvent, AbuseReport, EmergencyAccessPayload, AbuseReportPayload } from '../../types/emergency';

import {
  MOCK_PATIENTS,
  MOCK_DOCTORS,
  MOCK_RECORDS,
  MOCK_RECORD_METADATA,
  MOCK_GRANTS,
  MOCK_CONSENT_EVENTS,
  MOCK_EMERGENCY_EVENTS,
  MOCK_ABUSE_REPORTS,
  MOCK_AUDIT_ENTRIES,
  MOCK_ABHA_REGISTRY,
  type MockAuditEntry,
} from './mockData';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Base simulated latency in ms. Each call jitters ±30% around this. */
const MOCK_LATENCY_MS = 400;

/**
 * Override map for testing error scenarios.
 * Key: method name (e.g. 'getRecord'). Value: ApiErrorCode to return.
 *
 * Usage in tests or dev:
 *   import { MOCK_ERROR_OVERRIDES } from './__mocks__/mockCanister';
 *   MOCK_ERROR_OVERRIDES.set('getRecord', 'NOT_FOUND');
 */
export const MOCK_ERROR_OVERRIDES = new Map<string, string>();

// ---------------------------------------------------------------------------
// In-Memory State (seeded from mockData.ts, mutated by CRUD operations)
// ---------------------------------------------------------------------------

const db = {
  users:     new Map<string, UserProfile>(
    [...MOCK_PATIENTS, ...MOCK_DOCTORS].map((u) => [u.id, u])
  ),
  usersByPrincipal: new Map<string, UserProfile>(
    [...MOCK_PATIENTS, ...MOCK_DOCTORS].map((u) => [u.principal, u])
  ),
  records:   new Map<string, MedicalRecord>(MOCK_RECORDS.map((r) => [r.id, r])),
  grants:    new Map<string, AccessGrant>(MOCK_GRANTS.map((g) => [g.id, g])),
  consent:   new Map<string, ConsentEvent>(MOCK_CONSENT_EVENTS.map((e) => [e.id, e])),
  emergency: new Map<string, EmergencyAccessEvent>(MOCK_EMERGENCY_EVENTS.map((e) => [e.id, e])),
  reports:   new Map<string, AbuseReport>(MOCK_ABUSE_REPORTS.map((r) => [r.id, r])),
  audit:     new Map<string, MockAuditEntry>(MOCK_AUDIT_ENTRIES.map((a) => [a.id, a])),
};

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Simulated network delay with jitter */
const delay = (): Promise<void> => {
  const jitter = (Math.random() - 0.5) * 0.6 * MOCK_LATENCY_MS;
  return new Promise((r) => setTimeout(r, MOCK_LATENCY_MS + jitter));
};

/** Wrap a value in a success response */
const ok = <T>(data: T): CanisterResponse<T> => ({ ok: true, data });

/** Wrap an error in a failure response */
const err = <T>(code: string, message: string): CanisterResponse<T> => ({
  ok: false,
  error: { code: code as never, message },
});

/** Paginate an array */
const paginate = <T>(
  items: T[],
  params: QueryParams
): PaginatedResponse<T> => {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    items: slice,
    total: items.length,
    page,
    pageSize,
    hasMore: start + pageSize < items.length,
  };
};

/** Check error override for a method */
const checkOverride = <T>(method: string): CanisterResponse<T> | null => {
  const code = MOCK_ERROR_OVERRIDES.get(method);
  if (!code) return null;
  return err<T>(code, `[Mock] Forced error for method: ${method}`);
};

/** Generate a short UUID-like ID */
const newId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const nowIso = (): string => new Date().toISOString();

// ---------------------------------------------------------------------------
// Mock Canister Implementation
// ---------------------------------------------------------------------------

export const mockCanister = {

  // ==========================================================================
  // USER
  // ==========================================================================

  /** Register a new user profile (called on first login). */
  registerUser: async (
    payload: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CanisterResponse<UserProfile>> => {
    await delay();
    const override = checkOverride<UserProfile>('registerUser');
    if (override) return override;

    if (db.usersByPrincipal.has(payload.principal)) {
      return err('ALREADY_EXISTS', 'A profile already exists for this principal.');
    }

    const profile: UserProfile = {
      ...payload,
      id: newId('user'),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.users.set(profile.id, profile);
    db.usersByPrincipal.set(profile.principal, profile);
    return ok(profile);
  },

  /** Fetch a user profile by principal. */
  getUser: async (principal: string): Promise<CanisterResponse<UserProfile>> => {
    await delay();
    const override = checkOverride<UserProfile>('getUser');
    if (override) return override;

    const profile = db.usersByPrincipal.get(principal);
    if (!profile) return err('NOT_FOUND', `No profile found for principal: ${principal}`);
    return ok(profile);
  },

  /** Also usable as getMyProfile — same implementation */
  getMyProfile: async (principal: string): Promise<CanisterResponse<UserProfile>> => {
    return mockCanister.getUser(principal);
  },

  /** Update profile fields. */
  updateUser: async (
    update: Partial<UserProfile> & { principal: string }
  ): Promise<CanisterResponse<UserProfile>> => {
    await delay();
    const override = checkOverride<UserProfile>('updateUser');
    if (override) return override;

    const existing = db.usersByPrincipal.get(update.principal);
    if (!existing) return err('NOT_FOUND', 'Profile not found');

    const updated: UserProfile = {
      ...existing,
      ...update,
      updatedAt: nowIso(),
    };
    db.users.set(updated.id, updated);
    db.usersByPrincipal.set(updated.principal, updated);
    return ok(updated);
  },

  // ==========================================================================
  // RECORDS
  // ==========================================================================

  /** List records for an owner with optional filters and pagination. */
  listRecords: async (
    params: QueryParams & { category?: string; ownerId?: string }
  ): Promise<CanisterResponse<PaginatedResponse<RecordMetadata>>> => {
    await delay();
    const override = checkOverride<PaginatedResponse<RecordMetadata>>('listRecords');
    if (override) return override;

    let items = MOCK_RECORD_METADATA;
    if (params.ownerId) {
      items = items.filter((r) => r.ownerId === params.ownerId);
    }
    if (params.category && params.category !== 'all') {
      items = items.filter((r) => r.category === params.category);
    }
    return ok(paginate(items, params));
  },

  /** Fetch the full record (with encryption artifacts) — owner only. */
  getRecord: async (id: string): Promise<CanisterResponse<MedicalRecord>> => {
    await delay();
    const override = checkOverride<MedicalRecord>('getRecord');
    if (override) return override;

    const record = db.records.get(id);
    if (!record) return err('NOT_FOUND', `Record not found: ${id}`);
    return ok(record);
  },

  /** Create a new medical record. */
  createRecord: async (
    payload: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CanisterResponse<MedicalRecord>> => {
    await delay();
    const override = checkOverride<MedicalRecord>('createRecord');
    if (override) return override;

    const record: MedicalRecord = {
      ...payload,
      id: newId('rec'),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    db.records.set(record.id, record);
    return ok(record);
  },

  /** Delete a record — owner only. */
  deleteRecord: async (id: string): Promise<CanisterResponse<{ deleted: true }>> => {
    await delay();
    const override = checkOverride<{ deleted: true }>('deleteRecord');
    if (override) return override;

    if (!db.records.has(id)) return err('NOT_FOUND', `Record not found: ${id}`);
    db.records.delete(id);
    return ok({ deleted: true as const });
  },

  // ==========================================================================
  // ACCESS GRANTS
  // ==========================================================================

  /** Doctor submits an access request → creates a pending grant. */
  requestAccess: async (
    payload: AccessRequest & { doctorId: string; doctorName: string; patientName: string }
  ): Promise<CanisterResponse<AccessGrant>> => {
    await delay();
    const override = checkOverride<AccessGrant>('requestAccess');
    if (override) return override;

    const grant: AccessGrant = {
      id: newId('grant'),
      patientId:    payload.patientId,
      doctorId:     payload.doctorId,
      doctorName:   payload.doctorName,
      patientName:  payload.patientName,
      recordIds:    payload.recordIds,
      status:       'pending',
      reason:       payload.reason,
      grantedAt:    null,
      expiresAt:    null,
      revokedAt:    null,
      statusReason: null,
      createdAt:    nowIso(),
      updatedAt:    nowIso(),
    };
    db.grants.set(grant.id, grant);
    return ok(grant);
  },

  /** List grants visible to the calling user (filtered by role). */
  listGrants: async (
    params: QueryParams & { role: 'patient' | 'doctor'; callerId: string }
  ): Promise<CanisterResponse<PaginatedResponse<AccessGrant>>> => {
    await delay();
    const override = checkOverride<PaginatedResponse<AccessGrant>>('listGrants');
    if (override) return override;

    let items = [...db.grants.values()];
    if (params.role === 'patient') {
      items = items.filter((g) => g.patientId === params.callerId);
    } else {
      items = items.filter((g) => g.doctorId === params.callerId);
    }
    // Sort newest first
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(paginate(items, params));
  },

  /** Patient approves a pending grant. */
  approveGrant: async (
    payload: AccessApprovalPayload
  ): Promise<CanisterResponse<AccessGrant>> => {
    await delay();
    const override = checkOverride<AccessGrant>('approveGrant');
    if (override) return override;

    const grant = db.grants.get(payload.grantId);
    if (!grant) return err('NOT_FOUND', 'Grant not found');
    if (grant.status !== 'pending') return err('CONFLICT', `Grant is already ${grant.status}`);

    const updated: AccessGrant = {
      ...grant,
      status:    'approved',
      grantedAt: nowIso(),
      expiresAt: payload.expiresAt,
      updatedAt: nowIso(),
    };
    db.grants.set(updated.id, updated);
    return ok(updated);
  },

  /** Patient denies a pending grant. */
  denyGrant: async (
    payload: AccessDenialPayload
  ): Promise<CanisterResponse<AccessGrant>> => {
    await delay();
    const override = checkOverride<AccessGrant>('denyGrant');
    if (override) return override;

    const grant = db.grants.get(payload.grantId);
    if (!grant) return err('NOT_FOUND', 'Grant not found');
    if (grant.status !== 'pending') return err('CONFLICT', `Grant is already ${grant.status}`);

    const updated: AccessGrant = {
      ...grant,
      status:       'denied',
      statusReason: payload.reason ?? null,
      updatedAt:    nowIso(),
    };
    db.grants.set(updated.id, updated);
    return ok(updated);
  },

  /** Patient revokes a previously approved grant. */
  revokeGrant: async (
    payload: AccessDenialPayload
  ): Promise<CanisterResponse<AccessGrant>> => {
    await delay();
    const override = checkOverride<AccessGrant>('revokeGrant');
    if (override) return override;

    const grant = db.grants.get(payload.grantId);
    if (!grant) return err('NOT_FOUND', 'Grant not found');
    if (grant.status !== 'approved') return err('CONFLICT', `Cannot revoke a ${grant.status} grant`);

    const updated: AccessGrant = {
      ...grant,
      status:       'revoked',
      revokedAt:    nowIso(),
      statusReason: payload.reason ?? null,
      updatedAt:    nowIso(),
    };
    db.grants.set(updated.id, updated);
    return ok(updated);
  },

  /** Get the ordered consent event timeline for a grant. */
  getConsentTimeline: async (
    grantId: string
  ): Promise<CanisterResponse<ConsentEvent[]>> => {
    await delay();
    const override = checkOverride<ConsentEvent[]>('getConsentTimeline');
    if (override) return override;

    const events = [...db.consent.values()]
      .filter((e) => e.grantId === grantId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    return ok(events);
  },

  // ==========================================================================
  // EMERGENCY ACCESS
  // ==========================================================================

  /** Doctor triggers break-glass emergency access. */
  triggerEmergency: async (
    payload: EmergencyAccessPayload & { doctorId: string; doctorName: string; doctorAffiliation: string; patientName: string }
  ): Promise<CanisterResponse<EmergencyAccessEvent>> => {
    await delay();
    const override = checkOverride<EmergencyAccessEvent>('triggerEmergency');
    if (override) return override;

    const event: EmergencyAccessEvent = {
      id:                newId('emergency'),
      doctorId:          payload.doctorId,
      doctorName:        payload.doctorName,
      doctorAffiliation: payload.doctorAffiliation,
      patientId:         payload.patientId,
      patientName:       payload.patientName,
      reason:            payload.reason,
      justification:     payload.justification,
      recordsAccessed:   [],
      status:            'active',
      createdAt:         nowIso(),
      acknowledgedAt:    null,
      resolvedAt:        null,
    };
    db.emergency.set(event.id, event);
    return ok(event);
  },

  /** List emergency events for the calling user (patient or doctor). */
  listEmergencyEvents: async (
    params: QueryParams & { role: 'patient' | 'doctor'; callerId: string }
  ): Promise<CanisterResponse<PaginatedResponse<EmergencyAccessEvent>>> => {
    await delay();
    const override = checkOverride<PaginatedResponse<EmergencyAccessEvent>>('listEmergencyEvents');
    if (override) return override;

    let items = [...db.emergency.values()];
    if (params.role === 'patient') {
      items = items.filter((e) => e.patientId === params.callerId);
    } else {
      items = items.filter((e) => e.doctorId === params.callerId);
    }
    items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return ok(paginate(items, params));
  },

  /** Patient acknowledges they've seen an emergency access event. */
  acknowledgeEmergency: async (
    eventId: string
  ): Promise<CanisterResponse<EmergencyAccessEvent>> => {
    await delay();
    const override = checkOverride<EmergencyAccessEvent>('acknowledgeEmergency');
    if (override) return override;

    const event = db.emergency.get(eventId);
    if (!event) return err('NOT_FOUND', 'Emergency event not found');
    if (event.status !== 'active') return err('CONFLICT', `Event is already ${event.status}`);

    const updated: EmergencyAccessEvent = {
      ...event,
      status:         'acknowledged',
      acknowledgedAt: nowIso(),
    };
    db.emergency.set(updated.id, updated);
    return ok(updated);
  },

  // ==========================================================================
  // ABUSE REPORTS
  // ==========================================================================

  /** Patient submits an abuse report against an emergency access event. */
  submitAbuseReport: async (
    payload: AbuseReportPayload & { reporterId: string }
  ): Promise<CanisterResponse<AbuseReport>> => {
    await delay();
    const override = checkOverride<AbuseReport>('submitAbuseReport');
    if (override) return override;

    // Mark the emergency event as 'reported'
    const event = db.emergency.get(payload.emergencyEventId);
    if (event) {
      db.emergency.set(event.id, { ...event, status: 'reported' });
    }

    const report: AbuseReport = {
      id:                newId('report'),
      reporterId:        payload.reporterId,
      emergencyEventId:  payload.emergencyEventId,
      description:       payload.description,
      evidence:          payload.evidence ?? [],
      createdAt:         nowIso(),
      resolvedAt:        null,
      resolutionNotes:   null,
    };
    db.reports.set(report.id, report);
    return ok(report);
  },

  /** List all abuse reports (admin view). */
  listAbuseReports: async (
    params: QueryParams
  ): Promise<CanisterResponse<PaginatedResponse<AbuseReport>>> => {
    await delay();
    const override = checkOverride<PaginatedResponse<AbuseReport>>('listAbuseReports');
    if (override) return override;

    const items = [...db.reports.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    return ok(paginate(items, params));
  },

  // ==========================================================================
  // AUDIT / TIMELINE
  // ==========================================================================

  /** List audit entries for a user or entity, paginated for infinite scroll. */
  listAuditEntries: async (
    params: QueryParams & { entityId?: string; actorId?: string }
  ): Promise<CanisterResponse<PaginatedResponse<MockAuditEntry>>> => {
    await delay();
    const override = checkOverride<PaginatedResponse<MockAuditEntry>>('listAuditEntries');
    if (override) return override;

    let items = [...db.audit.values()];
    if (params.entityId) {
      items = items.filter((a) => a.entityId === params.entityId);
    }
    if (params.actorId) {
      items = items.filter((a) => a.actor === params.actorId);
    }
    items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return ok(paginate(items, params));
  },

  // ==========================================================================
  // ABHA
  // ==========================================================================

  /** Verify an ABHA ID — checks mock registry. */
  verifyAbhaId: async (
    abhaId: string
  ): Promise<CanisterResponse<{ isValid: boolean; name?: string; errorMessage?: string }>> => {
    await delay();
    const entry = MOCK_ABHA_REGISTRY[abhaId.replace(/-/g, '')];
    if (!entry) {
      return ok({ isValid: false, errorMessage: 'ABHA ID not found in registry' });
    }
    return ok({ isValid: true, name: entry.name });
  },

  /** Look up a patient by ABHA ID (doctor portal). */
  lookupPatientByAbha: async (
    abhaId: string
  ): Promise<CanisterResponse<typeof MOCK_ABHA_REGISTRY[string] & { abhaId: string }>> => {
    await delay();
    const entry = MOCK_ABHA_REGISTRY[abhaId.replace(/-/g, '')];
    if (!entry) {
      return err('NOT_FOUND', 'No patient found for this ABHA ID');
    }
    return ok({ ...entry, abhaId });
  },
};

// ---------------------------------------------------------------------------
// Export type so useCanister.ts can type the actor
// ---------------------------------------------------------------------------

export type MockCanister = typeof mockCanister;

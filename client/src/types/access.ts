// =============================================================================
// MedVault — Access Grant Types
// Workstream 3: Client State & Integration
//
// Consumed by:
//   - useAccess.ts                         (Workstream 3)
//   - AccessRequestCard, AccessGrantModal,
//     ConsentTimeline, LinkedProviders      (Workstream 4)
//   - accessController.ts                  (Workstream 1 must mirror in Candid)
//
// ACCESS LIFECYCLE:
//   Doctor sends AccessRequest
//     → canister creates AccessGrant (status: 'pending')
//     → Patient approves / denies
//     → If approved: Doctor can read RecordMetadata + decrypt via Lit
//     → Patient may revoke at any time → status: 'revoked'
//     → Grant expires at `expiresAt` → status: 'expired' (canister-side)
// =============================================================================

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type AccessStatus =
  | 'pending'   // Doctor requested, patient has not responded yet
  | 'approved'  // Patient approved — doctor has active access
  | 'denied'    // Patient denied the request
  | 'revoked'   // Patient revoked a previously approved grant
  | 'expired';  // `expiresAt` passed — canister marks this automatically

/** Badge colour mapping for UI (Workstream 4 can import). */
export const ACCESS_STATUS_COLORS: Record<AccessStatus, string> = {
  pending:  'yellow',
  approved: 'green',
  denied:   'red',
  revoked:  'orange',
  expired:  'gray',
};

// ---------------------------------------------------------------------------
// Core Grant Types
// ---------------------------------------------------------------------------

/**
 * An access grant record stored on the canister.
 * Created when a doctor submits an AccessRequest.
 *
 * Workstream 1: mirror as Candid record in server/lib/types.ts → AccessGrant.
 */
export interface AccessGrant {
  /** UUID — primary key on the canister. */
  id: string;

  /** Principal of the patient whose records are being requested. */
  patientId: string;

  /** Principal of the doctor requesting access. */
  doctorId: string;

  /** Display name of the doctor — denormalised for fast UI rendering. */
  doctorName: string;

  /** Display name of the patient — denormalised for fast UI rendering. */
  patientName: string;

  /**
   * Specific record IDs the doctor is requesting access to.
   * Empty array = requesting access to ALL records (patient decides scope).
   */
  recordIds: string[];

  status: AccessStatus;

  /** Free-text reason the doctor provided with the access request. */
  reason: string;

  /** ISO 8601 — when the patient approved. Null if not yet approved. */
  grantedAt: string | null;

  /**
   * ISO 8601 — when this grant expires.
   * Set by the patient at approval time. Null = no expiry (permanent grant).
   */
  expiresAt: string | null;

  /** ISO 8601 — when the patient revoked. Null if not revoked. */
  revokedAt: string | null;

  /** Free-text reason for denial or revocation. */
  statusReason: string | null;

  /** ISO 8601 — when the access request was originally submitted. */
  createdAt: string;

  /** ISO 8601 — last status update. */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Access Request (Input from Doctor)
// ---------------------------------------------------------------------------

/**
 * Payload sent by a doctor to request patient record access.
 * POSTed to the canister → creates an AccessGrant with status 'pending'.
 */
export interface AccessRequest {
  /** Principal of the target patient. */
  patientId: string;

  /**
   * IDs of specific records requested.
   * Empty array = requesting all records.
   */
  recordIds: string[];

  /** Why access is needed (required field). */
  reason: string;

  /**
   * Requested duration in hours.
   * Patient may grant a shorter duration at approval time.
   * 0 = requesting permanent access.
   */
  requestedDurationHours: number;
}

// ---------------------------------------------------------------------------
// Approval Payload (Input from Patient)
// ---------------------------------------------------------------------------

/**
 * Payload sent by a patient to approve an access grant.
 */
export interface AccessApprovalPayload {
  grantId: string;
  /**
   * ISO 8601 expiry datetime chosen by the patient.
   * Null = no expiry.
   */
  expiresAt: string | null;
}

/**
 * Payload sent by a patient to deny or revoke a grant.
 */
export interface AccessDenialPayload {
  grantId: string;
  /** Optional explanation shown to the doctor. */
  reason?: string;
}

// ---------------------------------------------------------------------------
// Consent Event (Audit trail for a single grant)
// ---------------------------------------------------------------------------

export type ConsentAction =
  | 'requested'   // Doctor submitted the request
  | 'approved'    // Patient approved
  | 'denied'      // Patient denied
  | 'revoked'     // Patient revoked after approval
  | 'expired'     // System marked as expired
  | 'viewed'      // Doctor viewed a record under this grant
  | 'modified';   // Grant scope was modified (e.g. records added/removed)

/**
 * A single event in the audit trail for an AccessGrant.
 * All grant lifecycle changes are immutably logged as ConsentEvents.
 *
 * Workstream 1: mirror as Candid record → ConsentEvent.
 */
export interface ConsentEvent {
  /** UUID. */
  id: string;

  /** The grant this event belongs to. */
  grantId: string;

  action: ConsentAction;

  /** Principal of the user who triggered this action. */
  actor: string;

  /** Display name of the actor. */
  actorName: string;

  /** ISO 8601 timestamp. */
  timestamp: string;

  /** Optional structured details (e.g. which record was viewed). */
  details?: Record<string, string>;
}

/**
 * Ordered list of consent events for a single grant.
 * Returned by useConsentTimeline(grantId).
 */
export type ConsentTimeline = ConsentEvent[];

// ---------------------------------------------------------------------------
// Summary / Counts (for dashboard widgets)
// ---------------------------------------------------------------------------

export interface AccessSummary {
  totalGranted: number;
  totalPending: number;
  totalRevoked: number;
  totalExpired: number;
}

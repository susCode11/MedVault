// =============================================================================
// MedVault — Emergency Access Types
// Workstream 3: Client State & Integration
//
// Consumed by:
//   - useEmergency.ts                          (Workstream 3)
//   - useReport.ts                             (Workstream 3)
//   - notificationStore.ts (emergency banner)  (Workstream 3)
//   - BreakGlassButton, EmergencyForm,
//     EmergencyAuditLog, ReportAbuseModal      (Workstream 4)
//   - emergencyController.ts, reportController.ts  (Workstream 1 → Candid)
//
// BREAK-GLASS MODEL:
//   A doctor can invoke emergency access to a patient's records WITHOUT prior
//   consent. This bypasses the normal AccessGrant flow but is:
//     1. Fully logged as an EmergencyAccessEvent (immutable on-chain)
//     2. Immediately visible to the patient via real-time notification
//     3. Reportable as abuse by the patient
//   This design ensures accountability without blocking emergency care.
// =============================================================================

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type EmergencyStatus =
  | 'active'       // Break-glass triggered, patient not yet notified/acknowledged
  | 'acknowledged' // Patient has seen and acknowledged the emergency access
  | 'reported'     // Patient flagged this as potential abuse (AbuseReport filed)
  | 'resolved';    // Admin closed the event after review

/** Badge colour mapping for UI (Workstream 4). */
export const EMERGENCY_STATUS_COLORS: Record<EmergencyStatus, string> = {
  active:       'red',
  acknowledged: 'yellow',
  reported:     'orange',
  resolved:     'gray',
};

// ---------------------------------------------------------------------------
// Emergency Access Event
// ---------------------------------------------------------------------------

/**
 * Immutable record created when a doctor invokes break-glass access.
 *
 * Workstream 1: mirror as Candid record → EmergencyAccessEvent.
 */
export interface EmergencyAccessEvent {
  /** UUID — primary key on the canister. */
  id: string;

  /** Principal of the doctor who triggered the emergency access. */
  doctorId: string;

  /** Display name — denormalised for fast UI rendering. */
  doctorName: string;

  /** Hospital / affiliation at time of access. */
  doctorAffiliation: string;

  /** Principal of the patient whose records were accessed. */
  patientId: string;

  /** Display name — denormalised. */
  patientName: string;

  /**
   * Short reason code for the emergency.
   * e.g. "unconscious_patient" | "critical_care" | "mass_casualty"
   */
  reason: string;

  /**
   * Free-text clinical justification the doctor must provide.
   * Minimum 20 characters enforced on the canister.
   */
  justification: string;

  /** IDs of the specific records that were accessed during the emergency. */
  recordsAccessed: string[];

  status: EmergencyStatus;

  /** ISO 8601 — when break-glass was triggered. */
  createdAt: string;

  /** ISO 8601 — when the patient acknowledged. Null if not yet acknowledged. */
  acknowledgedAt: string | null;

  /** ISO 8601 — when the event was resolved by an admin. */
  resolvedAt: string | null;
}

// ---------------------------------------------------------------------------
// Break-Glass Trigger (Input from Doctor)
// ---------------------------------------------------------------------------

/**
 * Payload sent by a doctor to invoke break-glass emergency access.
 */
export interface EmergencyAccessPayload {
  /** Principal of the patient whose records to access. */
  patientId: string;

  /** Short reason code. */
  reason: string;

  /** Detailed clinical justification. */
  justification: string;
}

// ---------------------------------------------------------------------------
// Abuse Report
// ---------------------------------------------------------------------------

/**
 * Filed by a patient who believes an emergency access was unjustified.
 *
 * Workstream 1: mirror as Candid record → AbuseReport.
 */
export interface AbuseReport {
  /** UUID. */
  id: string;

  /** Principal of the patient submitting the report. */
  reporterId: string;

  /** The EmergencyAccessEvent being reported. */
  emergencyEventId: string;

  /** Free-text description of why the access is believed to be abusive. */
  description: string;

  /**
   * Optional supporting evidence — list of IPFS CIDs or URLs.
   * Could be screenshots, documents, etc.
   */
  evidence: string[];

  /** ISO 8601 — when the report was submitted. */
  createdAt: string;

  /**
   * ISO 8601 — when an admin resolved this report.
   * Null if still under review.
   */
  resolvedAt: string | null;

  /** Admin notes added during resolution. */
  resolutionNotes: string | null;
}

// ---------------------------------------------------------------------------
// Abuse Report Payload (Input from Patient)
// ---------------------------------------------------------------------------

export interface AbuseReportPayload {
  emergencyEventId: string;
  description: string;
  evidence?: string[];
}

// ---------------------------------------------------------------------------
// Emergency Notification (for notificationStore banner)
// ---------------------------------------------------------------------------

/**
 * Stripped-down shape used by notificationStore to render the emergency banner.
 * Derived from EmergencyAccessEvent but only carries what the UI needs.
 */
export interface EmergencyNotification {
  eventId: string;
  doctorName: string;
  doctorAffiliation: string;
  reason: string;
  triggeredAt: string;
  recordCount: number;
}

// ---------------------------------------------------------------------------
// Summary (for dashboard widgets)
// ---------------------------------------------------------------------------

export interface EmergencySummary {
  totalEvents: number;
  activeCount: number;
  acknowledgedCount: number;
  reportedCount: number;
}

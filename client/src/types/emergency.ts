// TODO (Workstream 1): BLANK SPACE - Type Sync
// Workstream 1 must verify these types match the final Azle backend Candid type definitions.

export interface EmergencyAccessEvent {
  id: string; // UUID
  patientId: string; // Principal string
  doctorId: string; // Principal string
  reason: string;
  timestamp: bigint; // Unix timestamp
  ipAddress?: string; // Optional metadata
}

export type AbuseStatus = 'pending_review' | 'dismissed' | 'action_taken';

export interface AbuseReport {
  id: string; // UUID
  eventId: string; // References the EmergencyAccessEvent ID
  patientId: string;
  doctorId: string;
  description: string;
  reportedAt: bigint;
  status: AbuseStatus;
}

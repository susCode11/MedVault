// TODO (Workstream 1): BLANK SPACE - Type Sync
// Workstream 1 must verify this type matches the final Azle backend Candid type definitions.

export type AuditAction = 
  | 'LOGIN'
  | 'VIEW_RECORD'
  | 'UPLOAD_RECORD'
  | 'GRANT_ACCESS'
  | 'REVOKE_ACCESS'
  | 'EMERGENCY_ACCESS'
  | 'FILE_ABUSE_REPORT';

export interface AuditEntry {
  id: string; // UUID
  actorId: string; // Principal string of the person performing the action
  patientId?: string; // Principal string of the patient affected
  action: AuditAction;
  details: string; // JSON string or human-readable description
  timestamp: bigint; // Unix timestamp
  ipAddress?: string;
}

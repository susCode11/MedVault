// ✅ Workstream 1: Type Sync COMPLETE — matches Azle backend Candid definitions.

export type AuditAction = 
  | 'LOGIN'
  | 'VIEW_RECORD'
  | 'UPLOAD_RECORD'
  | 'GRANT_ACCESS'
  | 'REVOKE_ACCESS'
  | 'EMERGENCY_ACCESS'
  | 'FILE_ABUSE_REPORT';

export interface AuditEntry {
  id: string;
  actorPrincipal: string;
  action: string;
  targetRecordId: [string] | [];
  targetPrincipal: [string] | [];
  timestamp: bigint;
  details: string;
}

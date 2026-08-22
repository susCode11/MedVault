// TODO (Workstream 1): BLANK SPACE - Type Sync
// Workstream 1 must verify this `AccessGrant` matches the final Azle backend Candid type definition.

export type AccessStatus = 'pending' | 'approved' | 'revoked' | 'expired';

export interface AccessGrant {
  id: string; // UUID
  patientId: string; // Principal string
  doctorId: string; // Principal string
  recordIds: string[]; // List of specific record IDs granted (or empty if all)
  grantedAt: bigint; // Unix timestamp
  expiresAt: bigint | null; // Null if permanent until revoked
  status: AccessStatus;
}

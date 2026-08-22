export type AccessStatus = 'pending' | 'granted' | 'denied' | 'expired' | 'revoked';
export type AccessType = 'read' | 'write' | 'emergency';

export interface AccessGrant {
  id: string;
  patientPrincipal: string;
  granteePrincipal: string;
  recordIds: string[];
  expiresAt: bigint;
  createdAt: bigint;
  revokedAt: [bigint] | [];
}

export interface AccessRequest {
  granteePrincipal: string;
  recordIds: string[];
  accessType: AccessType;
  reason: string;
  durationHours: number;
}

export type AccessStatus = 'pending' | 'granted' | 'denied' | 'expired' | 'revoked';
export type AccessType = 'read' | 'write' | 'emergency';

export interface AccessGrant {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  recordIds: string[];     // [] = all records
  accessType: AccessType;
  status: AccessStatus;
  reason: string;
  grantedAt?: number;
  expiresAt?: number;
  revokedAt?: number;
  createdAt: number;
}

export interface AccessRequest {
  doctorId: string;
  patientId: string;
  recordIds: string[];
  accessType: AccessType;
  reason: string;
  durationHours: number;
}

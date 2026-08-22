export interface EmergencyAccessEvent {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  reason: string;
  justification: string;
  recordsAccessed: string[];
  accessedAt: number;
  expiresAt: number;
  reported: boolean;
  reportId?: string;
}

export interface AbuseReport {
  id: string;
  emergencyEventId: string;
  reportedBy: string;
  reportedAt: number;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'dismissed';
  resolution?: string;
}

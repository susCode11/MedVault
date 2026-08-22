export interface EmergencyAccessEvent {
  id: string;
  requesterPrincipal: string;
  patientPrincipal: string;
  reason: string;
  status: string;
  createdAt: bigint;
  resolvedAt: [bigint] | [];
  resolverPrincipal: [string] | [];
}

export interface AbuseReport {
  id: string;
  reporterPrincipal: string;
  reportedPrincipal: string;
  emergencyEventId: string;
  reason: string;
  createdAt: bigint;
}

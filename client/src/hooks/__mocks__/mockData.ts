// =============================================================================
// MedVault — Mock Data Generator
// Workstream 3: Client State & Integration
// Phase 3: Mock Layer
//
// Centralized, deterministic mock data for all 10 TanStack Query hooks.
// Used by mockCanister.ts to serve realistic responses during development.
//
// RULES:
//   - All IDs are deterministic (not random) so data is stable across renders
//   - Data covers all entity types: users, records, access grants, emergency
//     events, abuse reports, audit entries, ABHA
//   - Every status/category variant is represented at least once
//
// WHEN TO REMOVE:
//   This file stays in place even after real canister integration.
//   It is used by unit tests and Storybook stories indefinitely.
// =============================================================================

import type { UserProfile, UserRole } from '../../types/auth';
import type { MedicalRecord, RecordMetadata, RecordCategory } from '../../types/records';
import type { AccessGrant, ConsentEvent, AccessStatus } from '../../types/access';
import type {
  EmergencyAccessEvent,
  AbuseReport,
  EmergencyStatus,
} from '../../types/emergency';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const iso = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

const future = (daysFromNow: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString();
};

// ---------------------------------------------------------------------------
// Mock Users
// ---------------------------------------------------------------------------

export const MOCK_PATIENTS: UserProfile[] = [
  {
    id: 'patient-001',
    principal: 'mock-patient-001-aaaaa-bbbbb',
    role: 'patient',
    displayName: 'Priya Sharma',
    avatarUrl: undefined,
    abhaId: '12345678901234',
    createdAt: iso(120),
    updatedAt: iso(5),
  },
  {
    id: 'patient-002',
    principal: 'mock-patient-002-ccccc-ddddd',
    role: 'patient',
    displayName: 'Rahul Mehta',
    avatarUrl: undefined,
    abhaId: '98765432109876',
    createdAt: iso(90),
    updatedAt: iso(2),
  },
  {
    id: 'patient-003',
    principal: 'mock-patient-003-eeeee-fffff',
    role: 'patient',
    displayName: 'Ananya Patel',
    abhaId: undefined,
    createdAt: iso(60),
    updatedAt: iso(1),
  },
  {
    id: 'patient-004',
    principal: 'mock-patient-004-ggggg-hhhhh',
    role: 'patient',
    displayName: 'Vikram Singh',
    abhaId: '11223344556677',
    createdAt: iso(30),
    updatedAt: iso(0),
  },
  {
    id: 'patient-005',
    principal: 'mock-patient-005-iiiii-jjjjj',
    role: 'patient',
    displayName: 'Deepika Nair',
    abhaId: '55667788990011',
    createdAt: iso(15),
    updatedAt: iso(0),
  },
];

export const MOCK_DOCTORS: UserProfile[] = [
  {
    id: 'doctor-001',
    principal: 'mock-doctor-001-kkkkk-lllll',
    role: 'doctor',
    displayName: 'Dr. Arjun Kapoor',
    licenseNumber: 'MCI-2019-DL-048231',
    affiliation: 'AIIMS New Delhi',
    createdAt: iso(180),
    updatedAt: iso(10),
  },
  {
    id: 'doctor-002',
    principal: 'mock-doctor-002-mmmmm-nnnnn',
    role: 'doctor',
    displayName: 'Dr. Sunita Rao',
    licenseNumber: 'MCI-2016-MH-012847',
    affiliation: 'KEM Hospital, Mumbai',
    createdAt: iso(200),
    updatedAt: iso(3),
  },
  {
    id: 'doctor-003',
    principal: 'mock-doctor-003-ooooo-ppppp',
    role: 'doctor',
    displayName: 'Dr. Ravi Iyer',
    licenseNumber: 'MCI-2020-TN-093156',
    affiliation: 'Apollo Hospital, Chennai',
    createdAt: iso(150),
    updatedAt: iso(7),
  },
];

// The "logged-in" patient used for most single-user tests
export const MOCK_CURRENT_PATIENT = MOCK_PATIENTS[0];
// The "logged-in" doctor used for most single-user tests
export const MOCK_CURRENT_DOCTOR = MOCK_DOCTORS[0];

// ---------------------------------------------------------------------------
// Mock Medical Records
// ---------------------------------------------------------------------------

const makeRecord = (
  id: string,
  ownerId: string,
  title: string,
  category: RecordCategory,
  description: string,
  fileType: string,
  fileSizeMB: number,
  tags: string[],
  daysAgo: number
): MedicalRecord => ({
  id,
  ownerId,
  title,
  category,
  description,
  ipfsCid: `Qm${id.replace(/-/g, '').toUpperCase().padEnd(44, '0')}`,
  encryptedSymmetricKey: `enc-key-${id}`,
  litAccessConditions: JSON.stringify({
    conditionType: 'evmBasic',
    contractAddress: '',
    standardContractType: '',
    chain: 'ethereum',
    method: '',
    parameters: [':userAddress'],
    returnValueTest: { comparator: '=', value: `owner-${id}` },
  }),
  fileType,
  fileSize: fileSizeMB * 1024 * 1024,
  tags,
  uploadedBy: ownerId,
  createdAt: iso(daysAgo),
  updatedAt: iso(Math.max(0, daysAgo - 2)),
});

export const MOCK_RECORDS: MedicalRecord[] = [
  makeRecord('rec-001', MOCK_PATIENTS[0].id, 'CBC Blood Test Report', 'lab_report', 'Complete blood count panel from Apollo Diagnostics', 'application/pdf', 0.5, ['blood', 'cbc', 'routine', '2024'], 90),
  makeRecord('rec-002', MOCK_PATIENTS[0].id, 'Chest X-Ray', 'imaging', 'Bilateral PA view, no active lesion', 'image/jpeg', 2.1, ['xray', 'chest', 'lungs', '2024'], 75),
  makeRecord('rec-003', MOCK_PATIENTS[0].id, 'Metformin Prescription', 'prescription', 'Type 2 Diabetes management — Metformin 500mg twice daily', 'application/pdf', 0.2, ['diabetes', 'metformin', 'prescription'], 60),
  makeRecord('rec-004', MOCK_PATIENTS[0].id, 'Discharge Summary — Appendectomy', 'discharge_summary', 'Laparoscopic appendectomy, uneventful recovery, discharged after 2 days', 'application/pdf', 1.2, ['surgery', 'appendix', '2023', 'discharge'], 180),
  makeRecord('rec-005', MOCK_PATIENTS[0].id, 'COVID-19 Vaccination Certificate', 'vaccination', 'Covishield Dose 1 & 2 + Booster', 'application/pdf', 0.3, ['covid', 'vaccination', 'covishield'], 400),
  makeRecord('rec-006', MOCK_PATIENTS[0].id, 'Health Insurance Policy', 'insurance', 'Star Health — Family Floater 10L', 'application/pdf', 3.5, ['insurance', 'star-health', '2024-2025'], 30),
  makeRecord('rec-007', MOCK_PATIENTS[0].id, 'MRI Brain Scan', 'imaging', 'T2 weighted MRI — No space occupying lesion', 'application/dicom', 45.0, ['mri', 'brain', 'neurology', '2024'], 45),
  makeRecord('rec-008', MOCK_PATIENTS[0].id, 'Lipid Profile', 'lab_report', 'Fasting lipid panel — elevated LDL noted', 'application/pdf', 0.4, ['lipid', 'cholesterol', 'ldl', 'routine'], 20),
  makeRecord('rec-009', MOCK_PATIENTS[0].id, 'Amlodipine Prescription', 'prescription', 'Hypertension management — Amlodipine 5mg once daily', 'application/pdf', 0.2, ['hypertension', 'amlodipine', 'bp'], 10),
  makeRecord('rec-010', MOCK_PATIENTS[0].id, 'Eye Examination Report', 'other', 'Annual ophthalmology checkup — mild myopia', 'application/pdf', 0.6, ['eye', 'vision', 'ophthalmology', '2024'], 5),

  // Patient 2 records
  makeRecord('rec-011', MOCK_PATIENTS[1].id, 'Thyroid Function Test', 'lab_report', 'TSH, T3, T4 panel — subclinical hypothyroidism', 'application/pdf', 0.4, ['thyroid', 'tsh', 't3', 't4'], 30),
  makeRecord('rec-012', MOCK_PATIENTS[1].id, 'Echocardiogram', 'imaging', 'Resting echo — normal LV function, EF 65%', 'application/pdf', 5.0, ['echo', 'heart', 'cardiology', 'ef'], 25),
];

/** Stripped metadata versions (for granted doctors) */
export const MOCK_RECORD_METADATA: RecordMetadata[] = MOCK_RECORDS.map(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ encryptedSymmetricKey, litAccessConditions, ...meta }) => meta
);

// ---------------------------------------------------------------------------
// Mock Access Grants
// ---------------------------------------------------------------------------

const makeGrant = (
  id: string,
  patientId: string,
  doctorId: string,
  patientName: string,
  doctorName: string,
  recordIds: string[],
  status: AccessStatus,
  reason: string,
  daysAgoCreated: number,
  daysAgoGranted?: number,
  daysUntilExpiry?: number
): AccessGrant => ({
  id,
  patientId,
  doctorId,
  patientName,
  doctorName,
  recordIds,
  status,
  reason,
  grantedAt: daysAgoGranted !== undefined ? iso(daysAgoGranted) : null,
  expiresAt: daysUntilExpiry !== undefined ? future(daysUntilExpiry) : null,
  revokedAt: status === 'revoked' ? iso(1) : null,
  statusReason: status === 'denied' ? 'Patient declined access' : status === 'revoked' ? 'Access no longer needed' : null,
  createdAt: iso(daysAgoCreated),
  updatedAt: iso(Math.max(0, daysAgoGranted ?? daysAgoCreated)),
});

export const MOCK_GRANTS: AccessGrant[] = [
  makeGrant('grant-001', MOCK_PATIENTS[0].id, MOCK_DOCTORS[0].id, 'Priya Sharma', 'Dr. Arjun Kapoor', ['rec-001', 'rec-002', 'rec-008'], 'approved', 'Routine cardiology review for hypertension management', 20, 18, 30),
  makeGrant('grant-002', MOCK_PATIENTS[0].id, MOCK_DOCTORS[1].id, 'Priya Sharma', 'Dr. Sunita Rao',  [], 'pending', 'Second opinion on MRI findings', 3),
  makeGrant('grant-003', MOCK_PATIENTS[0].id, MOCK_DOCTORS[2].id, 'Priya Sharma', 'Dr. Ravi Iyer',   ['rec-003', 'rec-009'], 'denied', 'Medication review for diabetes and hypertension', 30, undefined),
  makeGrant('grant-004', MOCK_PATIENTS[0].id, MOCK_DOCTORS[0].id, 'Priya Sharma', 'Dr. Arjun Kapoor', ['rec-001'], 'revoked', 'Follow-up consultation', 60, 55),
  makeGrant('grant-005', MOCK_PATIENTS[0].id, MOCK_DOCTORS[1].id, 'Priya Sharma', 'Dr. Sunita Rao',  ['rec-004', 'rec-005'], 'expired', 'Post-surgery follow-up', 90, 85),
  makeGrant('grant-006', MOCK_PATIENTS[1].id, MOCK_DOCTORS[0].id, 'Rahul Mehta',  'Dr. Arjun Kapoor', ['rec-011', 'rec-012'], 'approved', 'Cardiac monitoring', 15, 14, 45),
];

// ---------------------------------------------------------------------------
// Mock Consent Events
// ---------------------------------------------------------------------------

export const MOCK_CONSENT_EVENTS: ConsentEvent[] = [
  { id: 'ce-001', grantId: 'grant-001', action: 'requested', actor: MOCK_DOCTORS[0].principal,  actorName: 'Dr. Arjun Kapoor', timestamp: iso(20), details: { recordCount: '3' } },
  { id: 'ce-002', grantId: 'grant-001', action: 'approved',  actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma',     timestamp: iso(18), details: { expiresAt: future(30) } },
  { id: 'ce-003', grantId: 'grant-001', action: 'viewed',    actor: MOCK_DOCTORS[0].principal,  actorName: 'Dr. Arjun Kapoor', timestamp: iso(17), details: { recordId: 'rec-001' } },
  { id: 'ce-004', grantId: 'grant-001', action: 'viewed',    actor: MOCK_DOCTORS[0].principal,  actorName: 'Dr. Arjun Kapoor', timestamp: iso(10), details: { recordId: 'rec-002' } },
  { id: 'ce-005', grantId: 'grant-004', action: 'requested', actor: MOCK_DOCTORS[0].principal,  actorName: 'Dr. Arjun Kapoor', timestamp: iso(60) },
  { id: 'ce-006', grantId: 'grant-004', action: 'approved',  actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma',     timestamp: iso(55) },
  { id: 'ce-007', grantId: 'grant-004', action: 'revoked',   actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma',     timestamp: iso(1),  details: { reason: 'Access no longer needed' } },
];

// ---------------------------------------------------------------------------
// Mock Emergency Events
// ---------------------------------------------------------------------------

export const MOCK_EMERGENCY_EVENTS: EmergencyAccessEvent[] = [
  {
    id: 'emergency-001',
    doctorId: MOCK_DOCTORS[0].principal,
    doctorName: 'Dr. Arjun Kapoor',
    doctorAffiliation: 'AIIMS New Delhi',
    patientId: MOCK_PATIENTS[0].principal,
    patientName: 'Priya Sharma',
    reason: 'unconscious_patient',
    justification: 'Patient brought in unconscious to A&E. Requires immediate access to medication history and allergy records to prevent adverse drug interactions during emergency treatment.',
    recordsAccessed: ['rec-003', 'rec-009'],
    status: 'acknowledged' as EmergencyStatus,
    createdAt: iso(15),
    acknowledgedAt: iso(14),
    resolvedAt: null,
  },
  {
    id: 'emergency-002',
    doctorId: MOCK_DOCTORS[1].principal,
    doctorName: 'Dr. Sunita Rao',
    doctorAffiliation: 'KEM Hospital, Mumbai',
    patientId: MOCK_PATIENTS[0].principal,
    patientName: 'Priya Sharma',
    reason: 'critical_care',
    justification: 'Patient in ICU following cardiac event. Accessing ECG history and prior echo reports to guide immediate treatment protocol.',
    recordsAccessed: ['rec-002', 'rec-007'],
    status: 'reported' as EmergencyStatus,
    createdAt: iso(5),
    acknowledgedAt: iso(5),
    resolvedAt: null,
  },
  {
    id: 'emergency-003',
    doctorId: MOCK_DOCTORS[2].principal,
    doctorName: 'Dr. Ravi Iyer',
    doctorAffiliation: 'Apollo Hospital, Chennai',
    patientId: MOCK_PATIENTS[1].principal,
    patientName: 'Rahul Mehta',
    reason: 'critical_care',
    justification: 'Patient requires urgent cardiac catheterisation. Accessing prior imaging and discharge summary for surgical planning.',
    recordsAccessed: ['rec-011', 'rec-012'],
    status: 'active' as EmergencyStatus,
    createdAt: iso(0),
    acknowledgedAt: null,
    resolvedAt: null,
  },
];

// ---------------------------------------------------------------------------
// Mock Abuse Reports
// ---------------------------------------------------------------------------

export const MOCK_ABUSE_REPORTS: AbuseReport[] = [
  {
    id: 'report-001',
    reporterId: MOCK_PATIENTS[0].principal,
    emergencyEventId: 'emergency-002',
    description: 'I was not in a critical condition at the time of this access. The doctor accessed my records without my knowledge and I believe this was not a genuine emergency situation.',
    evidence: [],
    createdAt: iso(4),
    resolvedAt: null,
    resolutionNotes: null,
  },
];

// ---------------------------------------------------------------------------
// Mock Audit Entries (Timeline)
// ---------------------------------------------------------------------------

export interface MockAuditEntry {
  id: string;
  entityType: 'record' | 'grant' | 'emergency' | 'profile' | 'report';
  entityId: string;
  action: string;
  actor: string;
  actorName: string;
  actorRole: UserRole;
  timestamp: string;
  details?: Record<string, string>;
}

export const MOCK_AUDIT_ENTRIES: MockAuditEntry[] = [
  { id: 'audit-001', entityType: 'record',    entityId: 'rec-001', action: 'uploaded',    actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma',     actorRole: 'patient', timestamp: iso(90), details: { title: 'CBC Blood Test Report' } },
  { id: 'audit-002', entityType: 'record',    entityId: 'rec-002', action: 'uploaded',    actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma',     actorRole: 'patient', timestamp: iso(75) },
  { id: 'audit-003', entityType: 'grant',     entityId: 'grant-001', action: 'requested', actor: MOCK_DOCTORS[0].principal,  actorName: 'Dr. Arjun Kapoor', actorRole: 'doctor',  timestamp: iso(20) },
  { id: 'audit-004', entityType: 'grant',     entityId: 'grant-001', action: 'approved',  actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma',     actorRole: 'patient', timestamp: iso(18) },
  { id: 'audit-005', entityType: 'record',    entityId: 'rec-001', action: 'viewed',      actor: MOCK_DOCTORS[0].principal,  actorName: 'Dr. Arjun Kapoor', actorRole: 'doctor',  timestamp: iso(17), details: { grantId: 'grant-001' } },
  { id: 'audit-006', entityType: 'emergency', entityId: 'emergency-001', action: 'triggered', actor: MOCK_DOCTORS[0].principal, actorName: 'Dr. Arjun Kapoor', actorRole: 'doctor', timestamp: iso(15) },
  { id: 'audit-007', entityType: 'emergency', entityId: 'emergency-001', action: 'acknowledged', actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma', actorRole: 'patient', timestamp: iso(14) },
  { id: 'audit-008', entityType: 'record',    entityId: 'rec-008', action: 'uploaded',    actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma',     actorRole: 'patient', timestamp: iso(20) },
  { id: 'audit-009', entityType: 'grant',     entityId: 'grant-004', action: 'revoked',   actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma',     actorRole: 'patient', timestamp: iso(1) },
  { id: 'audit-010', entityType: 'emergency', entityId: 'emergency-002', action: 'triggered', actor: MOCK_DOCTORS[1].principal, actorName: 'Dr. Sunita Rao', actorRole: 'doctor', timestamp: iso(5) },
  { id: 'audit-011', entityType: 'report',    entityId: 'report-001', action: 'submitted', actor: MOCK_PATIENTS[0].principal, actorName: 'Priya Sharma',    actorRole: 'patient', timestamp: iso(4) },
  { id: 'audit-012', entityType: 'emergency', entityId: 'emergency-003', action: 'triggered', actor: MOCK_DOCTORS[2].principal, actorName: 'Dr. Ravi Iyer',  actorRole: 'doctor', timestamp: iso(0) },
];

// ---------------------------------------------------------------------------
// Mock ABHA Lookup Registry
// ---------------------------------------------------------------------------

export const MOCK_ABHA_REGISTRY: Record<string, { name: string; dob: string; gender: 'male' | 'female' | 'other'; principal: string | null; state: string }> = {
  '12345678901234': { name: 'Priya Sharma',  dob: '1988-03-15', gender: 'female', principal: MOCK_PATIENTS[0].principal, state: 'Delhi' },
  '98765432109876': { name: 'Rahul Mehta',   dob: '1975-11-22', gender: 'male',   principal: MOCK_PATIENTS[1].principal, state: 'Maharashtra' },
  '11223344556677': { name: 'Vikram Singh',  dob: '1992-07-04', gender: 'male',   principal: MOCK_PATIENTS[3].principal, state: 'Punjab' },
  '55667788990011': { name: 'Deepika Nair',  dob: '1995-01-30', gender: 'female', principal: MOCK_PATIENTS[4].principal, state: 'Kerala' },
  '99988877766655': { name: 'Suresh Kumar',  dob: '1960-06-12', gender: 'male',   principal: null,                       state: 'Tamil Nadu' },
};

// TODO (Workstream 1): BLANK SPACE - Type Sync
// Workstream 1 must verify this `MedicalRecord` matches the final Azle backend Candid type definition.

export type RecordCategory = 'prescription' | 'lab_report' | 'scan' | 'clinical_note' | 'other';

export interface MedicalRecord {
  id: string; // UUID
  patientId: string; // Patient Principal string
  uploaderId: string; // Principal string (can be patient or doctor)
  category: RecordCategory;
  title: string;
  description: string;
  ipfsCid: string; // Location of the encrypted blob on IPFS
  encryptionHash: string; // Hash used by Lit Protocol
  createdAt: bigint; // Unix timestamp in nanoseconds
  size: bigint; // File size in bytes
}

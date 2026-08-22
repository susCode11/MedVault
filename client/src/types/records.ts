export type RecordCategory = 'lab_report' | 'prescription' | 'imaging' | 'discharge_summary' | 'vaccination' | 'consultation' | 'other';
export type RecordStatus = 'active' | 'archived' | 'pending';

export interface MedicalRecord {
  id: string;
  patientPrincipal: string;
  doctorPrincipal: string;
  title: string;
  description: string;
  recordType: string;
  ipfsCid: string;
  encryptionKeyId: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface RecordFilter {
  category?: RecordCategory;
  status?: RecordStatus;
  search?: string;
  dateFrom?: number;
  dateTo?: number;
  tags?: string[];
}

export interface UploadProgress {
  stage: 'encrypting' | 'uploading' | 'registering' | 'complete' | 'error';
  percent: number;
  message: string;
}

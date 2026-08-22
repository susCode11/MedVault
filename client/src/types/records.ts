export type RecordCategory = 'lab_report' | 'prescription' | 'imaging' | 'discharge_summary' | 'vaccination' | 'consultation' | 'other';
export type RecordStatus = 'active' | 'archived' | 'pending';

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  title: string;
  description: string;
  category: RecordCategory;
  status: RecordStatus;
  ipfsCid: string;
  encryptedSymKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  hospital?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
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

export const APP_NAME = 'MedVault';

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  EMERGENCY: 'emergency',
} as const;

export const RECORD_CATEGORIES = {
  PRESCRIPTION: 'prescription',
  LAB_REPORT: 'lab_report',
  SCAN: 'scan',
  CLINICAL_NOTE: 'clinical_note',
  OTHER: 'other',
} as const;

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export const MESSAGES = {
  UPLOAD_SUCCESS: 'Record uploaded and encrypted successfully.',
  UPLOAD_ERROR: 'Failed to upload record. Please try again.',
  DECRYPT_ERROR: 'You do not have permission to decrypt this record.',
  ABHA_VERIFY_SUCCESS: 'ABHA ID verified successfully.',
  ABHA_VERIFY_ERROR: 'Invalid ABHA ID format or not found.',
};

// TODO (Workstream 4): BLANK SPACE - Theme Config
// Workstream 4 can add standard UI theme constants here if they don't want to rely 
// entirely on tailwind.config.js for programmatic color references (e.g. for canvas graphs).

export const CONSTANTS = {
  APP_NAME: 'MedVault',
  VERSION: '0.1.0',
  API_BASE: '/api/v1',
  MOCK_DELAY_MS: 500, // delay for mock api
  
  ROLES: {
    PATIENT: 'patient',
    DOCTOR: 'doctor',
    ADMIN: 'admin',
  },

  RECORD_CATEGORIES: [
    { id: 'lab_report', label: 'Lab Report', color: 'primary' },
    { id: 'prescription', label: 'Prescription', color: 'accent' },
    { id: 'imaging', label: 'Imaging/Scan', color: 'info' },
    { id: 'discharge_summary', label: 'Discharge Summary', color: 'warning' },
    { id: 'vaccination', label: 'Vaccination', color: 'success' },
    { id: 'consultation', label: 'Consultation Note', color: 'primary' },
    { id: 'other', label: 'Other', color: 'surface-border' },
  ] as const,

  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_FILE_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
};

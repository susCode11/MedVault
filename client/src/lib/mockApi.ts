import { UserProfile, LoginResponse, UserRole } from '../types/auth';
import { MedicalRecord, RecordFilter, RecordCategory, RecordStatus } from '../types/records';
import { AccessGrant, AccessRequest, AccessType, AccessStatus } from '../types/access';
import { CONSTANTS } from '../utils/constants';

// --- MOCK DATA ---
const mockUsers: Record<string, UserProfile> = {
  'patient-1': {
    id: 'patient-1',
    principal: 'aaaaa-aa',
    role: 'patient',
    displayName: 'John Doe',
    email: 'john@example.com',
    abhaId: '12-3456-7890-1234',
    abhaLinked: true,
    createdAt: Date.now() - 10000000,
    updatedAt: Date.now(),
  },
  'doctor-1': {
    id: 'doctor-1',
    principal: 'bbbbb-bb',
    role: 'doctor',
    displayName: 'Dr. Sarah Smith',
    email: 'sarah.smith@hospital.com',
    abhaLinked: false,
    createdAt: Date.now() - 20000000,
    updatedAt: Date.now(),
  }
};

let mockRecords: MedicalRecord[] = [
  {
    id: 'rec-1',
    patientId: 'patient-1',
    doctorId: 'doctor-1',
    title: 'Complete Blood Count',
    description: 'Annual physical bloodwork',
    category: 'lab_report',
    status: 'active',
    ipfsCid: 'QmX...',
    encryptedSymKey: 'enc...',
    fileName: 'cbc-report.pdf',
    fileSize: 102400,
    mimeType: 'application/pdf',
    hospital: 'City General',
    tags: ['blood', 'annual'],
    createdAt: Date.now() - 5000000,
    updatedAt: Date.now() - 5000000,
  },
  {
    id: 'rec-2',
    patientId: 'patient-1',
    title: 'Amoxicillin Prescription',
    description: 'For sinus infection',
    category: 'prescription',
    status: 'active',
    ipfsCid: 'QmY...',
    encryptedSymKey: 'enc...',
    fileName: 'prescription.pdf',
    fileSize: 51200,
    mimeType: 'application/pdf',
    hospital: 'City General',
    tags: ['antibiotic'],
    createdAt: Date.now() - 2000000,
    updatedAt: Date.now() - 2000000,
  }
];

let mockAccessGrants: AccessGrant[] = [];

// --- MOCK DELAY HELPER ---
const delay = (ms: number = CONSTANTS.MOCK_DELAY_MS) => new Promise(res => setTimeout(res, ms));

// --- MOCK API METHODS ---
export const mockAuthApi = {
  login: async (principal: string): Promise<LoginResponse> => {
    await delay();
    // In mock, let's just pick patient-1 or doctor-1 based on principal string roughly
    const isDoctor = principal.includes('doctor');
    const user = isDoctor ? mockUsers['doctor-1'] : mockUsers['patient-1'];
    return { token: 'mock-jwt-token-123', user };
  },
  getProfile: async (): Promise<UserProfile> => {
    await delay();
    return mockUsers['patient-1'];
  },
};

export const mockRecordApi = {
  getRecords: async (filter?: RecordFilter): Promise<MedicalRecord[]> => {
    await delay();
    let res = [...mockRecords];
    if (filter?.category) res = res.filter(r => r.category === filter.category);
    if (filter?.status) res = res.filter(r => r.status === filter.status);
    if (filter?.search) {
      const s = filter.search.toLowerCase();
      res = res.filter(r => r.title.toLowerCase().includes(s) || r.description.toLowerCase().includes(s));
    }
    return res.sort((a, b) => b.createdAt - a.createdAt);
  },
  getRecord: async (id: string): Promise<MedicalRecord> => {
    await delay();
    const rec = mockRecords.find(r => r.id === id);
    if (!rec) throw new Error("Not found");
    return rec;
  },
};

export const mockAccessApi = {
  getAccessGrants: async (): Promise<AccessGrant[]> => {
    await delay();
    return mockAccessGrants;
  },
};

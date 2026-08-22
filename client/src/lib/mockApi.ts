import { UserProfile, LoginResponse } from '../types/auth';
import { MedicalRecord, RecordFilter } from '../types/records';
import { AccessGrant } from '../types/access';
import { CONSTANTS } from '../utils/constants';

// --- MOCK DATA ---
const mockUsers: Record<string, UserProfile> = {
  'patient-1': {
    principal: 'aaaaa-aa',
    role: 'patient',
    name: 'John Doe',
    email: ['john@example.com'],
    abhaId: '12-3456-7890-1234',
    createdAt: BigInt(Date.now() - 10000000),
    updatedAt: BigInt(Date.now()),
    avatarUrl: []
  },
  'doctor-1': {
    principal: 'bbbbb-bb',
    role: 'doctor',
    name: 'Dr. Sarah Smith',
    email: ['sarah.smith@hospital.com'],
    abhaId: '',
    createdAt: BigInt(Date.now() - 20000000),
    updatedAt: BigInt(Date.now()),
    avatarUrl: []
  }
};

let mockRecords: MedicalRecord[] = [
  {
    id: 'rec-1',
    patientPrincipal: 'aaaaa-aa',
    doctorPrincipal: 'bbbbb-bb',
    title: 'Complete Blood Count',
    description: 'Annual physical bloodwork',
    recordType: 'lab_report',
    ipfsCid: 'QmX...',
    encryptionKeyId: 'enc...',
    createdAt: BigInt(Date.now() - 5000000),
    updatedAt: BigInt(Date.now() - 5000000),
  },
  {
    id: 'rec-2',
    patientPrincipal: 'aaaaa-aa',
    doctorPrincipal: 'bbbbb-bb',
    title: 'Amoxicillin Prescription',
    description: 'For sinus infection',
    recordType: 'prescription',
    ipfsCid: 'QmY...',
    encryptionKeyId: 'enc...',
    createdAt: BigInt(Date.now() - 2000000),
    updatedAt: BigInt(Date.now() - 2000000),
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
    if (filter?.category) res = res.filter(r => r.recordType === filter.category);
    if (filter?.search) {
      const s = filter.search.toLowerCase();
      res = res.filter(r => r.title.toLowerCase().includes(s) || r.description.toLowerCase().includes(s));
    }
    return res.sort((a, b) => Number(b.createdAt - a.createdAt));
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

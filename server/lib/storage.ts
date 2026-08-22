import { StableBTreeMap } from 'azle';
import { 
    UserProfile, 
    MedicalRecord, 
    AccessGrant, 
    AuditEntry, 
    EmergencyAccessEvent, 
    AbuseReport 
} from './types.js';

// Key: principal string, Value: UserProfile object
export const usersStorage = new StableBTreeMap<string, UserProfile>(0);

// Key: record UUID string, Value: MedicalRecord object
export const recordsStorage = new StableBTreeMap<string, MedicalRecord>(1);

// Key: grant UUID string, Value: AccessGrant object
export const accessStorage = new StableBTreeMap<string, AccessGrant>(2);

// Key: audit entry UUID string, Value: AuditEntry object
export const auditStorage = new StableBTreeMap<string, AuditEntry>(3);

// Key: emergency event UUID string, Value: EmergencyAccessEvent object
export const emergencyStorage = new StableBTreeMap<string, EmergencyAccessEvent>(4);

// Key: abuse report UUID string, Value: AbuseReport object
export const abuseReportsStorage = new StableBTreeMap<string, AbuseReport>(5);

// Key: ABHA ID string, Value: principal string
export const abhaIndexStorage = new StableBTreeMap<string, string>(6);

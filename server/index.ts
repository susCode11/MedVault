import { IDL, query, update, trap } from 'azle';
import { 
    UserProfileIDL, UserProfile,
    MedicalRecordIDL, MedicalRecord,
    AccessGrantIDL, AccessGrant,
    AuditEntryIDL, AuditEntry,
    EmergencyAccessEventIDL, EmergencyAccessEvent,
    AbuseReportIDL, AbuseReport
} from './lib/types.js';
import { 
    usersStorage, 
    recordsStorage, 
    accessStorage, 
    auditStorage, 
    emergencyStorage, 
    abuseReportsStorage, 
    abhaIndexStorage 
} from './lib/storage.js';
import { getCallerString, isAnonymous } from './utils/principal.js';
import { nowNanos, hoursToNanos, isExpired } from './utils/time.js';
import { isValidAbhaNumber } from './utils/abha.js';
import { generateUuid } from './utils/serialize.js';

function requireAuth(): string {
    const caller = getCallerString();
    if (isAnonymous(caller)) {
        trap("Unauthorized: Anonymous access not allowed");
    }
    return caller;
}

function requireRole(role: string): string {
    const caller = requireAuth();
    const user = usersStorage.get(caller);
    if (!user || user.role !== role && user.role !== 'admin') {
        trap(`Forbidden: Requires ${role} role`);
    }
    return caller;
}

function insertAudit(actorPrincipal: string, action: string, targetRecordId: string | null = null, targetPrincipal: string | null = null, details: string = "") {
    const auditId = generateUuid();
    auditStorage.insert(auditId, {
        id: auditId,
        actorPrincipal,
        action,
        targetRecordId: targetRecordId ? [targetRecordId] : [],
        targetPrincipal: targetPrincipal ? [targetPrincipal] : [],
        timestamp: nowNanos(),
        details
    });
}

export default class MedVaultBackend {
    
    // ==========================================
    // USER MANAGEMENT
    // ==========================================
    
    @update([IDL.Text, IDL.Text, IDL.Text], UserProfileIDL)
    registerUser(name: string, role: string, abhaId: string): UserProfile {
        const caller = requireAuth();
        
        if (usersStorage.containsKey(caller)) {
            trap("User already registered");
        }
        
        if (!isValidAbhaNumber(abhaId)) {
            trap("Invalid ABHA number format");
        }
        
        if (abhaIndexStorage.containsKey(abhaId)) {
            trap("ABHA ID already in use");
        }
        
        const profile: UserProfile = {
            principal: caller,
            name,
            role,
            abhaId,
            createdAt: nowNanos(),
            updatedAt: nowNanos()
        };
        
        usersStorage.insert(caller, profile);
        abhaIndexStorage.insert(abhaId, caller);
        
        insertAudit(caller, "register_user", null, caller, `Registered as ${role}`);
        
        return profile;
    }

    @query([], IDL.Opt(UserProfileIDL))
    getProfile(): [UserProfile] | [] {
        const caller = requireAuth();
        const profile = usersStorage.get(caller);
        return profile !== undefined ? [profile] : [];
    }

    // ==========================================
    // RECORD MANAGEMENT
    // ==========================================
    
    @update([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text], IDL.Text)
    createRecord(patientPrincipal: string, title: string, description: string, recordType: string, ipfsCid: string, encryptionKeyId: string): string {
        const doctor = requireRole('doctor');
        
        const patient = usersStorage.get(patientPrincipal);
        if (!patient || patient.role !== 'patient') {
            trap("Target user is not a registered patient");
        }
        
        const recordId = generateUuid();
        const record: MedicalRecord = {
            id: recordId,
            patientPrincipal,
            doctorPrincipal: doctor,
            title,
            description,
            recordType,
            ipfsCid,
            encryptionKeyId,
            createdAt: nowNanos(),
            updatedAt: nowNanos()
        };
        
        recordsStorage.insert(recordId, record);
        insertAudit(doctor, "create_record", recordId, patientPrincipal, "Record created by doctor");
        
        return recordId;
    }

    @query([IDL.Text], IDL.Opt(MedicalRecordIDL))
    getRecord(recordId: string): [MedicalRecord] | [] {
        const caller = requireAuth();
        const record = recordsStorage.get(recordId);
        
        if (!record) return [];
        
        if (record.patientPrincipal !== caller && record.doctorPrincipal !== caller) {
            // Check if there is an active access grant
            const grants = accessStorage.values();
            const hasAccess = grants.some(g => 
                g.granteePrincipal === caller && 
                g.patientPrincipal === record.patientPrincipal && 
                (g.recordIds.includes(recordId) || g.recordIds.includes('*')) &&
                !isExpired(g.expiresAt) &&
                g.revokedAt.length === 0
            );
            if (!hasAccess && requireRole('admin') !== caller) {
                trap("Forbidden: No access to this record");
            }
        }
        
        insertAudit(caller, "read_record", recordId, record.patientPrincipal, "Record accessed");
        return [record];
    }

    @query([], IDL.Vec(MedicalRecordIDL))
    listMyRecords(): MedicalRecord[] {
        const caller = requireAuth();
        const user = usersStorage.get(caller);
        if (!user) trap("User not found");
        
        const allRecords = recordsStorage.values();
        if (user.role === 'patient') {
            return allRecords.filter(r => r.patientPrincipal === caller);
        } else if (user.role === 'doctor') {
            return allRecords.filter(r => r.doctorPrincipal === caller);
        }
        return [];
    }
    
    // ==========================================
    // ACCESS MANAGEMENT
    // ==========================================
    
    @update([IDL.Text, IDL.Vec(IDL.Text), IDL.Nat32], IDL.Text)
    grantAccess(granteePrincipal: string, recordIds: string[], expiresInHours: number): string {
        const patient = requireRole('patient');
        
        const grantee = usersStorage.get(granteePrincipal);
        if (!grantee || grantee.role !== 'doctor') {
            trap("Grantee must be a registered doctor");
        }
        
        const grantId = generateUuid();
        const grant: AccessGrant = {
            id: grantId,
            patientPrincipal: patient,
            granteePrincipal,
            recordIds,
            expiresAt: nowNanos() + hoursToNanos(expiresInHours),
            createdAt: nowNanos(),
            revokedAt: []
        };
        
        accessStorage.insert(grantId, grant);
        insertAudit(patient, "grant_access", null, granteePrincipal, `Granted access for ${expiresInHours} hours`);
        
        return grantId;
    }

    @query([], IDL.Vec(AccessGrantIDL))
    listMyGrants(): AccessGrant[] {
        const caller = requireRole('patient');
        return accessStorage.values().filter(g => g.patientPrincipal === caller && !isExpired(g.expiresAt) && g.revokedAt.length === 0);
    }

    @query([], IDL.Vec(AccessGrantIDL))
    listGrantedToMe(): AccessGrant[] {
        const caller = requireRole('doctor');
        return accessStorage.values().filter(g => g.granteePrincipal === caller && !isExpired(g.expiresAt) && g.revokedAt.length === 0);
    }
}
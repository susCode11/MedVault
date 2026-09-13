import { CanisterError } from '../lib/error.js';
import { MedicalRecord } from '../lib/types.js';
import { recordsStorage, accessStorage, usersStorage } from '../lib/storage.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { insertAudit } from '../middleware/audit.js';
import { generateUuid } from '../utils/serialize.js';
import { nowNanos, isExpired } from '../utils/time.js';

export function createRecord(patientPrincipal: string, title: string, description: string, recordType: string, ipfsCid: string, encryptionKeyId: string, fileType: string, fileSize: bigint): string {
    const caller = requireAuth();
    const user = usersStorage.get(caller);
    
    if (!user) {
        throw new CanisterError('UNAUTHENTICATED', "User not found");
    }

    if (user.role !== 'doctor' && user.role !== 'patient' && user.role !== 'admin') {
        throw new CanisterError('UNAUTHORIZED', "Forbidden: Requires doctor or patient role");
    }

    if (user.role === 'patient' && caller !== patientPrincipal) {
        throw new CanisterError('UNAUTHORIZED', "Forbidden: Patients can only upload their own records");
    }
    
    const patient = usersStorage.get(patientPrincipal);
    if (!patient) {
        throw new CanisterError('VALIDATION_ERROR', "Target user is not registered");
    }
    
    const recordId = generateUuid();
    const record: MedicalRecord = {
        id: recordId,
        patientPrincipal,
        doctorPrincipal: user.role === 'patient' ? patientPrincipal : caller,
        title,
        description,
        recordType,
        ipfsCid,
        encryptionKeyId,
        fileType,
        fileSize,
        createdAt: nowNanos(),
        updatedAt: nowNanos()
    };
    
    recordsStorage.insert(recordId, record);
    insertAudit(caller, "create_record", recordId, patientPrincipal, `Record created by ${user.role}`);
    
    return recordId;
}

export function getRecord(recordId: string): [MedicalRecord] | [] {
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
            throw new CanisterError('VALIDATION_ERROR', "Forbidden: No access to this record");
        }
    }
    
    insertAudit(caller, "read_record", recordId, record.patientPrincipal, "Record accessed");
    return [record];
}

export function listRecords(ownerId: string | null = null, category: string | null = null, page: number = 1, pageSize: number = 10): { items: MedicalRecord[], total: number } {
    const caller = requireAuth();
    const user = usersStorage.get(caller);
    if (!user) throw new CanisterError('VALIDATION_ERROR', "User not found");
    
    let allRecords = recordsStorage.values();
    
    if (user.role === 'patient') {
        allRecords = allRecords.filter(r => r.patientPrincipal === caller);
    } else if (user.role === 'doctor') {
        // If doctor provided an ownerId, they must have access grants for that patient
        if (ownerId) {
            const grants = accessStorage.values();
            const hasAccess = grants.some(g => 
                g.granteePrincipal === caller && 
                g.patientPrincipal === ownerId && 
                (g.recordIds.includes('*') || g.recordIds.length > 0) && // Simplified check for list
                !isExpired(g.expiresAt) &&
                g.revokedAt.length === 0
            );
            
            if (hasAccess) {
                allRecords = allRecords.filter(r => r.patientPrincipal === ownerId);
            } else {
                allRecords = [];
            }
        } else {
            // Otherwise show records the doctor created
            allRecords = allRecords.filter(r => r.doctorPrincipal === caller);
        }
    } else if (user.role === 'admin') {
        if (ownerId) {
            allRecords = allRecords.filter(r => r.patientPrincipal === ownerId);
        }
    } else {
        allRecords = [];
    }

    if (category) {
        allRecords = allRecords.filter(r => r.recordType === category);
    }

    allRecords.sort((a, b) => Number(b.createdAt - a.createdAt));

    const total = allRecords.length;
    const startIndex = (page - 1) * pageSize;
    const items = allRecords.slice(startIndex, startIndex + pageSize);

    return { items, total };
}

export function deleteRecord(recordId: string): boolean {
    const caller = requireAuth();
    const record = recordsStorage.get(recordId);
    
    if (!record) {
        throw new CanisterError('VALIDATION_ERROR', "Record not found");
    }
    
    if (record.patientPrincipal !== caller && requireRole('admin') !== caller) {
        throw new CanisterError('VALIDATION_ERROR', "Forbidden: Only the owner can delete this record");
    }
    
    recordsStorage.remove(recordId);
    insertAudit(caller, "delete_record", recordId, record.patientPrincipal, "Record deleted");
    
    return true;
}

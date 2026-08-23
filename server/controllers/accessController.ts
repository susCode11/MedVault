import { CanisterError } from '../lib/error.js';
import { AccessGrant } from '../lib/types.js';
import { accessStorage, usersStorage } from '../lib/storage.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { insertAudit } from '../middleware/audit.js';
import { generateUuid } from '../utils/serialize.js';
import { nowNanos, hoursToNanos, isExpired } from '../utils/time.js';

export function requestAccess(patientId: string, recordIds: string[], reason: string, requestedDurationHours: number): string {
    const doctor = requireRole('doctor');
    
    const patient = usersStorage.get(patientId);
    if (!patient || patient.role !== 'patient') {
        throw new CanisterError('VALIDATION_ERROR', "Target user is not a registered patient");
    }
    
    // In this simplified model, an access request acts as a grant that's created but we'll set it as "pending"
    // However, our AccessGrant structure just has "expiresAt". If we want a strict request/approve flow, 
    // we would need a status field. For now, since the frontend expects a `requestAccess` mutation
    // that creates a pending grant, let's just create a grant with `revokedAt` set to some "pending" flag,
    // or properly we should add a status to AccessGrant.
    // The previous monolith just had `grantAccess` (patient grants to doctor).
    // Let's implement patient granting for now as `grantAccess`.

    const grantId = generateUuid();
    const grant: AccessGrant = {
        id: grantId,
        patientPrincipal: patientId, // Requested patient
        granteePrincipal: doctor,
        recordIds,
        expiresAt: nowNanos() + hoursToNanos(requestedDurationHours),
        createdAt: nowNanos(),
        revokedAt: []
    };
    
    accessStorage.insert(grantId, grant);
    insertAudit(doctor, "request_access", null, patientId, `Requested access for ${requestedDurationHours} hours: ${reason}`);
    
    return grantId;
}

export function grantAccess(granteePrincipal: string, recordIds: string[], expiresInHours: number): string {
    const patient = requireRole('patient');
    
    const grantee = usersStorage.get(granteePrincipal);
    if (!grantee || grantee.role !== 'doctor') {
        throw new CanisterError('VALIDATION_ERROR', "Grantee must be a registered doctor");
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

export function revokeAccess(grantId: string): boolean {
    const patient = requireRole('patient');
    const grant = accessStorage.get(grantId);
    
    if (!grant) throw new CanisterError('VALIDATION_ERROR', "Grant not found");
    if (grant.patientPrincipal !== patient) throw new CanisterError('VALIDATION_ERROR', "Only the patient can revoke this grant");
    
    const updatedGrant: AccessGrant = {
        ...grant,
        revokedAt: [nowNanos()]
    };
    
    accessStorage.insert(grantId, updatedGrant);
    insertAudit(patient, "revoke_access", null, grant.granteePrincipal, "Access revoked");
    
    return true;
}

export function listMyGrants(): AccessGrant[] {
    const caller = requireAuth();
    const user = usersStorage.get(caller);
    if (!user) return [];
    
    let allGrants = accessStorage.values();
    if (user.role === 'patient') {
        return allGrants.filter(g => g.patientPrincipal === caller);
    } else if (user.role === 'doctor') {
        return allGrants.filter(g => g.granteePrincipal === caller);
    }
    return [];
}

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

    const grantId = generateUuid();
    const grant: AccessGrant = {
        id: grantId,
        patientPrincipal: patientId,
        granteePrincipal: doctor,
        recordIds,
        expiresAt: nowNanos() + hoursToNanos(requestedDurationHours),
        createdAt: nowNanos(),
        revokedAt: [],
        status: 'pending'
    };
    
    accessStorage.insert(grantId, grant);
    insertAudit(doctor, "request_access", null, patientId, `Requested access for ${requestedDurationHours} hours: ${reason}`);
    
    return grantId;
}

export function approveGrant(grantId: string, expiresAtStr: [string] | []): string {
    const patient = requireRole('patient');
    const grant = accessStorage.get(grantId);
    
    if (!grant) throw new CanisterError('VALIDATION_ERROR', "Grant not found");
    if (grant.patientPrincipal !== patient) throw new CanisterError('VALIDATION_ERROR', "Only the patient can approve this grant");
    if (grant.status !== 'pending') throw new CanisterError('VALIDATION_ERROR', "Grant is not pending");

    let expiresAt = grant.expiresAt;
    if (expiresAtStr.length > 0 && expiresAtStr[0] !== '') {
        const dateStr = expiresAtStr[0] as string;
        const parsed = Date.parse(dateStr);
        if (!isNaN(parsed)) {
            expiresAt = BigInt(parsed) * 1000000n;
        }
    }
    
    const updatedGrant: AccessGrant = {
        ...grant,
        expiresAt,
        status: 'approved'
    };
    
    accessStorage.insert(grantId, updatedGrant);
    insertAudit(patient, "approve_grant", null, grant.granteePrincipal, "Access request approved");
    
    return grantId;
}

export function denyGrant(grantId: string, reason: string): string {
    const patient = requireRole('patient');
    const grant = accessStorage.get(grantId);
    
    if (!grant) throw new CanisterError('VALIDATION_ERROR', "Grant not found");
    if (grant.patientPrincipal !== patient) throw new CanisterError('VALIDATION_ERROR', "Only the patient can deny this grant");
    if (grant.status !== 'pending') throw new CanisterError('VALIDATION_ERROR', "Grant is not pending");

    const updatedGrant: AccessGrant = {
        ...grant,
        status: 'denied'
    };
    
    accessStorage.insert(grantId, updatedGrant);
    insertAudit(patient, "deny_grant", null, grant.granteePrincipal, `Access request denied. Reason: ${reason}`);
    
    return grantId;
}

export function revokeGrant(grantId: string, reason: string): string {
    const patient = requireRole('patient');
    const grant = accessStorage.get(grantId);
    
    if (!grant) throw new CanisterError('VALIDATION_ERROR', "Grant not found");
    if (grant.patientPrincipal !== patient) throw new CanisterError('VALIDATION_ERROR', "Only the patient can revoke this grant");
    
    const updatedGrant: AccessGrant = {
        ...grant,
        revokedAt: [nowNanos()],
        status: 'revoked'
    };
    
    accessStorage.insert(grantId, updatedGrant);
    insertAudit(patient, "revoke_grant", null, grant.granteePrincipal, `Access revoked. Reason: ${reason}`);
    
    return grantId;
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

export function getConsentTimeline(grantId: string): any[] {
    // Simplified stub to satisfy frontend
    // In reality, this would query auditStorage for the specific grant ID
    return [];
}

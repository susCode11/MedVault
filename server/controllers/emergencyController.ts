import { CanisterError } from '../lib/error.js';
import { EmergencyAccessEvent } from '../lib/types.js';
import { emergencyStorage, usersStorage } from '../lib/storage.js';
import { requireRole, requireAuth } from '../middleware/auth.js';
import { insertAudit } from '../middleware/audit.js';
import { generateUuid } from '../utils/serialize.js';
import { nowNanos } from '../utils/time.js';

export function triggerEmergencyAccess(patientId: string, reason: string, justification: string): string {
    const doctor = requireRole('doctor');
    
    const patient = usersStorage.get(patientId);
    if (!patient || patient.role !== 'patient') {
        throw new CanisterError('VALIDATION_ERROR', "Target user is not a registered patient");
    }
    
    const eventId = generateUuid();
    const event: EmergencyAccessEvent = {
        id: eventId,
        requesterPrincipal: doctor,
        patientPrincipal: patientId,
        reason: `${reason}: ${justification}`,
        status: 'pending',
        createdAt: nowNanos(),
        resolvedAt: [],
        resolverPrincipal: []
    };
    
    emergencyStorage.insert(eventId, event);
    insertAudit(doctor, "emergency_request", null, patientId, `Break-glass emergency access triggered`);
    
    return eventId;
}

export function resolveEmergencyAccess(eventId: string, status: string): boolean {
    const admin = requireRole('admin');
    const event = emergencyStorage.get(eventId);
    
    if (!event) throw new CanisterError('VALIDATION_ERROR', "Emergency event not found");
    
    const updatedEvent: EmergencyAccessEvent = {
        ...event,
        status,
        resolvedAt: [nowNanos()],
        resolverPrincipal: [admin]
    };
    
    emergencyStorage.insert(eventId, updatedEvent);
    insertAudit(admin, status === 'approved' ? 'emergency_approve' : 'emergency_deny', null, event.requesterPrincipal, `Emergency access ${status}`);
    
    return true;
}

export function listEmergencyEvents(): EmergencyAccessEvent[] {
    const caller = requireAuth();
    const user = usersStorage.get(caller);
    if (!user) return [];
    
    const events = emergencyStorage.values();
    
    if (user.role === 'admin') {
        return events;
    } else if (user.role === 'doctor') {
        return events.filter(e => e.requesterPrincipal === caller);
    } else if (user.role === 'patient') {
        return events.filter(e => e.patientPrincipal === caller);
    }
    return [];
}

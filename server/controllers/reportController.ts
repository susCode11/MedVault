import { CanisterError } from '../lib/error.js';
import { AbuseReport } from '../lib/types.js';
import { abuseReportsStorage, emergencyStorage, usersStorage } from '../lib/storage.js';
import { requireRole } from '../middleware/auth.js';
import { insertAudit } from '../middleware/audit.js';
import { generateUuid } from '../utils/serialize.js';
import { nowNanos } from '../utils/time.js';

export function submitAbuseReport(emergencyEventId: string, reason: string): string {
    const patient = requireRole('patient');
    
    const emergencyEvent = emergencyStorage.get(emergencyEventId);
    if (!emergencyEvent) {
        throw new CanisterError('VALIDATION_ERROR', "Emergency event not found");
    }
    if (emergencyEvent.patientPrincipal !== patient) {
        throw new CanisterError('VALIDATION_ERROR', "Only the patient can report abuse for this event");
    }
    
    const reportId = generateUuid();
    const report: AbuseReport = {
        id: reportId,
        reporterPrincipal: patient,
        reportedPrincipal: emergencyEvent.requesterPrincipal,
        emergencyEventId,
        reason,
        createdAt: nowNanos()
    };
    
    abuseReportsStorage.insert(reportId, report);
    insertAudit(patient, "report_abuse", null, emergencyEvent.requesterPrincipal, `Reported abuse for emergency event ${emergencyEventId}`);
    
    return reportId;
}

export function listAbuseReports(): AbuseReport[] {
    requireRole('admin');
    return abuseReportsStorage.values();
}

import { auditStorage } from '../lib/storage.js';
import { generateUuid } from '../utils/serialize.js';
import { nowNanos } from '../utils/time.js';

export function insertAudit(
    actorPrincipal: string, 
    action: string, 
    targetRecordId: string | null = null, 
    targetPrincipal: string | null = null, 
    details: string = ""
) {
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

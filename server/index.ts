import { IDL, query, update } from 'azle';
import { 
    UserProfileIDL, UserProfile,
    MedicalRecordIDL, MedicalRecord,
    AccessGrantIDL, AccessGrant,
    EmergencyAccessEventIDL, EmergencyAccessEvent,
    AbuseReportIDL, AbuseReport,
    CanisterResponseIDL, CanisterResponse,
    PinataConfigIDL, PinataConfig
} from './lib/types.js';
import { withResponse } from './lib/wrapper.js';

import * as userCtrl from './controllers/userController.js';
import * as recordCtrl from './controllers/recordController.js';
import * as accessCtrl from './controllers/accessController.js';
import * as emergencyCtrl from './controllers/emergencyController.js';
import * as reportCtrl from './controllers/reportController.js';

const PaginatedMedicalRecordsIDL = IDL.Record({ items: IDL.Vec(MedicalRecordIDL), total: IDL.Nat32 });
type PaginatedMedicalRecords = { items: MedicalRecord[], total: number };

export default class MedVaultBackend {
    
    // ==========================================
    // USER MANAGEMENT
    // ==========================================
    
    @update([IDL.Text, IDL.Text, IDL.Text], CanisterResponseIDL(UserProfileIDL))
    registerUser(name: string, role: string, abhaId: string): CanisterResponse<UserProfile> {
        return withResponse(() => userCtrl.registerUser(name, role, abhaId));
    }

    @update([IDL.Text], CanisterResponseIDL(UserProfileIDL))
    linkAbhaId(abhaId: string): CanisterResponse<UserProfile> {
        return withResponse(() => userCtrl.linkAbhaId(abhaId));
    }

    @update([IDL.Text], CanisterResponseIDL(UserProfileIDL))
    linkLicenseNumber(licenseNumber: string): CanisterResponse<UserProfile> {
        return withResponse(() => userCtrl.linkLicenseNumber(licenseNumber));
    }

    @update([IDL.Text], CanisterResponseIDL(UserProfileIDL))
    updateName(name: string): CanisterResponse<UserProfile> {
        return withResponse(() => userCtrl.updateName(name));
    }

    @query([], CanisterResponseIDL(IDL.Opt(UserProfileIDL)))
    getProfile(): CanisterResponse<[UserProfile] | []> {
        return withResponse(() => userCtrl.getProfile());
    }

    @query([IDL.Text], CanisterResponseIDL(IDL.Opt(UserProfileIDL)))
    lookupPatientByAbha(abhaId: string): CanisterResponse<[UserProfile] | []> {
        return withResponse(() => userCtrl.lookupPatientByAbha(abhaId));
    }

    // ==========================================
    // RECORD MANAGEMENT
    // ==========================================
    
    @update([IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Nat64], CanisterResponseIDL(IDL.Text))
    createRecord(patientPrincipal: string, title: string, description: string, recordType: string, ipfsCid: string, encryptionKeyId: string, fileType: string, fileSize: bigint): CanisterResponse<string> {
        return withResponse(() => recordCtrl.createRecord(patientPrincipal, title, description, recordType, ipfsCid, encryptionKeyId, fileType, fileSize));
    }

    @query([IDL.Text], CanisterResponseIDL(IDL.Opt(MedicalRecordIDL)))
    getRecord(recordId: string): CanisterResponse<[MedicalRecord] | []> {
        return withResponse(() => recordCtrl.getRecord(recordId));
    }

    @query([IDL.Opt(IDL.Text), IDL.Opt(IDL.Text), IDL.Nat32, IDL.Nat32], CanisterResponseIDL(PaginatedMedicalRecordsIDL))
    listRecords(ownerIdOpt: [string] | [], categoryOpt: [string] | [], page: number, pageSize: number): CanisterResponse<PaginatedMedicalRecords> {
        return withResponse(() => {
            const ownerId = ownerIdOpt.length > 0 ? ownerIdOpt[0] : null;
            const category = categoryOpt.length > 0 ? categoryOpt[0] : null;
            return recordCtrl.listRecords(ownerId, category, page, pageSize);
        });
    }

    @query([], CanisterResponseIDL(IDL.Vec(MedicalRecordIDL)))
    listMyRecords(): CanisterResponse<MedicalRecord[]> {
        return withResponse(() => recordCtrl.listRecords(null, null, 1, 1000).items);
    }
    
    @update([IDL.Text], CanisterResponseIDL(IDL.Bool))
    deleteRecord(recordId: string): CanisterResponse<boolean> {
        return withResponse(() => recordCtrl.deleteRecord(recordId));
    }
    
    // ==========================================
    // ACCESS MANAGEMENT
    // ==========================================
    
    @update([IDL.Text, IDL.Vec(IDL.Text), IDL.Text, IDL.Nat32], CanisterResponseIDL(IDL.Text))
    requestAccess(patientId: string, recordIds: string[], reason: string, requestedDurationHours: number): CanisterResponse<string> {
        return withResponse(() => accessCtrl.requestAccess(patientId, recordIds, reason, requestedDurationHours));
    }

    @update([IDL.Text, IDL.Opt(IDL.Text)], CanisterResponseIDL(IDL.Text))
    approveGrant(grantId: string, expiresAt: [string] | []): CanisterResponse<string> {
        return withResponse(() => accessCtrl.approveGrant(grantId, expiresAt));
    }

    @update([IDL.Text, IDL.Text], CanisterResponseIDL(IDL.Text))
    denyGrant(grantId: string, reason: string): CanisterResponse<string> {
        return withResponse(() => accessCtrl.denyGrant(grantId, reason));
    }

    @update([IDL.Text, IDL.Text], CanisterResponseIDL(IDL.Text))
    revokeGrant(grantId: string, reason: string): CanisterResponse<string> {
        return withResponse(() => accessCtrl.revokeGrant(grantId, reason));
    }

    @query([], CanisterResponseIDL(IDL.Vec(AccessGrantIDL)))
    listMyGrants(): CanisterResponse<AccessGrant[]> {
        return withResponse(() => accessCtrl.listMyGrants());
    }

    @query([IDL.Text], CanisterResponseIDL(IDL.Vec(IDL.Text))) // Using Text for stub
    getConsentTimeline(grantId: string): CanisterResponse<any[]> {
        return withResponse(() => accessCtrl.getConsentTimeline(grantId));
    }

    // ==========================================
    // EMERGENCY ACCESS
    // ==========================================
    
    @update([IDL.Text, IDL.Text, IDL.Text], CanisterResponseIDL(IDL.Text))
    triggerEmergencyAccess(patientId: string, reason: string, justification: string): CanisterResponse<string> {
        return withResponse(() => emergencyCtrl.triggerEmergencyAccess(patientId, reason, justification));
    }

    @update([IDL.Text, IDL.Text], CanisterResponseIDL(IDL.Bool))
    resolveEmergencyAccess(eventId: string, status: string): CanisterResponse<boolean> {
        return withResponse(() => emergencyCtrl.resolveEmergencyAccess(eventId, status));
    }

    @query([], CanisterResponseIDL(IDL.Vec(EmergencyAccessEventIDL)))
    listEmergencyEvents(): CanisterResponse<EmergencyAccessEvent[]> {
        return withResponse(() => emergencyCtrl.listEmergencyEvents());
    }

    // ==========================================
    // ABUSE REPORTS
    // ==========================================
    
    @update([IDL.Text, IDL.Text], CanisterResponseIDL(IDL.Text))
    submitAbuseReport(emergencyEventId: string, reason: string): CanisterResponse<string> {
        return withResponse(() => reportCtrl.submitAbuseReport(emergencyEventId, reason));
    }

    @query([], CanisterResponseIDL(IDL.Vec(AbuseReportIDL)))
    listAbuseReports(): CanisterResponse<AbuseReport[]> {
        return withResponse(() => reportCtrl.listAbuseReports());
    }

    // ==========================================
    // CONFIGURATION
    // ==========================================
    
    @query([], CanisterResponseIDL(PinataConfigIDL))
    getPinataConfig(): CanisterResponse<PinataConfig> {
        return withResponse(() => {
            const jwt = process.env.VITE_PINATA_JWT || '';
            const gateway = process.env.VITE_PINATA_GATEWAY || '';
            if (!jwt) {
                console.log("Warning: Pinata JWT not configured on backend");
            }
            return { jwt, gateway };
        });
    }
}
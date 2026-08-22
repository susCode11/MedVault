import { IDL } from 'azle';

// =========================================
// ENUMS & TYPES
// =========================================

export type Role = 'patient' | 'doctor' | 'admin';
export type RecordType = 'lab_report' | 'prescription' | 'imaging' | 'discharge_summary' | 'vaccination' | 'clinical_notes' | 'other';
export type AuditAction = 'create_record' | 'read_record' | 'update_record' | 'delete_record' | 'grant_access' | 'revoke_access' | 'emergency_request' | 'emergency_approve' | 'emergency_deny' | 'report_abuse';
export type EmergencyStatus = 'pending' | 'approved' | 'denied' | 'expired';

// =========================================
// CANDID IDL DEFINITIONS
// =========================================

export const UserProfileIDL = IDL.Record({
    principal: IDL.Text,
    name: IDL.Text,
    role: IDL.Text, // 'patient' | 'doctor' | 'admin'
    abhaId: IDL.Text,
    createdAt: IDL.Nat64,
    updatedAt: IDL.Nat64,
});

export type UserProfile = {
    principal: string;
    name: string;
    role: string;
    abhaId: string;
    createdAt: bigint;
    updatedAt: bigint;
};

export const MedicalRecordIDL = IDL.Record({
    id: IDL.Text,
    patientPrincipal: IDL.Text,
    doctorPrincipal: IDL.Text,
    title: IDL.Text,
    description: IDL.Text,
    recordType: IDL.Text,
    ipfsCid: IDL.Text,
    encryptionKeyId: IDL.Text,
    createdAt: IDL.Nat64,
    updatedAt: IDL.Nat64,
});

export type MedicalRecord = {
    id: string;
    patientPrincipal: string;
    doctorPrincipal: string;
    title: string;
    description: string;
    recordType: string;
    ipfsCid: string;
    encryptionKeyId: string;
    createdAt: bigint;
    updatedAt: bigint;
};

export const AccessGrantIDL = IDL.Record({
    id: IDL.Text,
    patientPrincipal: IDL.Text,
    granteePrincipal: IDL.Text,
    recordIds: IDL.Vec(IDL.Text),
    expiresAt: IDL.Nat64,
    createdAt: IDL.Nat64,
    revokedAt: IDL.Opt(IDL.Nat64),
});

export type AccessGrant = {
    id: string;
    patientPrincipal: string;
    granteePrincipal: string;
    recordIds: string[];
    expiresAt: bigint;
    createdAt: bigint;
    revokedAt: [bigint] | []; // Opts in Azle are arrays
};

export const AuditEntryIDL = IDL.Record({
    id: IDL.Text,
    actorPrincipal: IDL.Text,
    action: IDL.Text,
    targetRecordId: IDL.Opt(IDL.Text),
    targetPrincipal: IDL.Opt(IDL.Text),
    timestamp: IDL.Nat64,
    details: IDL.Text,
});

export type AuditEntry = {
    id: string;
    actorPrincipal: string;
    action: string;
    targetRecordId: [string] | [];
    targetPrincipal: [string] | [];
    timestamp: bigint;
    details: string;
};

export const EmergencyAccessEventIDL = IDL.Record({
    id: IDL.Text,
    requesterPrincipal: IDL.Text,
    patientPrincipal: IDL.Text,
    reason: IDL.Text,
    status: IDL.Text, // 'pending' | 'approved' | 'denied' | 'expired'
    createdAt: IDL.Nat64,
    resolvedAt: IDL.Opt(IDL.Nat64),
    resolverPrincipal: IDL.Opt(IDL.Text),
});

export type EmergencyAccessEvent = {
    id: string;
    requesterPrincipal: string;
    patientPrincipal: string;
    reason: string;
    status: string;
    createdAt: bigint;
    resolvedAt: [bigint] | [];
    resolverPrincipal: [string] | [];
};

export const AbuseReportIDL = IDL.Record({
    id: IDL.Text,
    reporterPrincipal: IDL.Text,
    reportedPrincipal: IDL.Text,
    emergencyEventId: IDL.Text,
    reason: IDL.Text,
    createdAt: IDL.Nat64,
});

export type AbuseReport = {
    id: string;
    reporterPrincipal: string;
    reportedPrincipal: string;
    emergencyEventId: string;
    reason: string;
    createdAt: bigint;
};

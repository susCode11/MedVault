import { CanisterError } from '../lib/error.js';
import { UserProfile } from '../lib/types.js';
import { usersStorage, abhaIndexStorage } from '../lib/storage.js';
import { requireAuth } from '../middleware/auth.js';
import { insertAudit } from '../middleware/audit.js';
import { isValidAbhaNumber, normalizeAbha } from '../utils/abha.js';
import { nowNanos } from '../utils/time.js';

export function registerUser(name: string, role: string, abhaId: string): UserProfile {
    const caller = requireAuth();
    
    if (usersStorage.containsKey(caller)) {
        throw new CanisterError('VALIDATION_ERROR', "User already registered");
    }
    
    const normalizedAbha = abhaId ? normalizeAbha(abhaId) : '';
    if (normalizedAbha) {
        if (!isValidAbhaNumber(normalizedAbha)) {
            throw new CanisterError('VALIDATION_ERROR', "Invalid ABHA number format");
        }
        
        if (abhaIndexStorage.containsKey(normalizedAbha)) {
            throw new CanisterError('VALIDATION_ERROR', "ABHA ID already in use");
        }
    }
    
    const profile: UserProfile = {
        principal: caller,
        name,
        role,
        abhaId: normalizedAbha,
        licenseNumber: "",
        createdAt: nowNanos(),
        updatedAt: nowNanos()
    };
    
    usersStorage.insert(caller, profile);
    
    if (normalizedAbha) {
        abhaIndexStorage.insert(normalizedAbha, caller);
    }
    
    insertAudit(caller, "register_user", null, caller, `Registered as ${role}`);
    
    return profile;
}

export function getProfile(): [UserProfile] | [] {
    const caller = requireAuth();
    const profile = usersStorage.get(caller);
    return profile !== undefined ? [profile] : [];
}

export function lookupPatientByAbha(abhaId: string): [UserProfile] | [] {
    requireAuth(); // Any authenticated user can lookup
    const normalizedAbha = normalizeAbha(abhaId);
    const patientPrincipal = abhaIndexStorage.get(normalizedAbha);
    if (patientPrincipal) {
        const profile = usersStorage.get(patientPrincipal);
        if (profile && profile.role === 'patient') {
            return [profile];
        }
    }
    return [];
}

export function linkAbhaId(abhaId: string): UserProfile {
    const caller = requireAuth();
    const profile = usersStorage.get(caller);
    
    if (!profile) {
        throw new CanisterError('NOT_FOUND', "User profile not found");
    }
    
    const normalizedAbha = normalizeAbha(abhaId);
    if (!isValidAbhaNumber(normalizedAbha)) {
        throw new CanisterError('VALIDATION_ERROR', "Invalid ABHA number format");
    }
    
    if (abhaIndexStorage.containsKey(normalizedAbha)) {
        throw new CanisterError('VALIDATION_ERROR', "ABHA ID already in use");
    }
    
    // Update profile
    const updatedProfile = {
        ...profile,
        abhaId: normalizedAbha,
        updatedAt: nowNanos()
    };
    
    usersStorage.insert(caller, updatedProfile);
    abhaIndexStorage.insert(normalizedAbha, caller);
    
    insertAudit(caller, "link_abha", null, caller, `Linked ABHA ID: ${abhaId}`);
    
    return updatedProfile;
}

export function linkLicenseNumber(licenseNumber: string): UserProfile {
    const caller = requireAuth();
    const profile = usersStorage.get(caller);
    
    if (!profile) {
        throw new CanisterError('NOT_FOUND', "User profile not found");
    }
    
    if (profile.role !== 'doctor') {
        throw new CanisterError('VALIDATION_ERROR', "Only doctors can link a license number");
    }
    
    // Update profile
    const updatedProfile = {
        ...profile,
        licenseNumber,
        updatedAt: nowNanos()
    };
    
    usersStorage.insert(caller, updatedProfile);
    
    insertAudit(caller, "link_license", null, caller, `Linked NMC License: ${licenseNumber}`);
    
    return updatedProfile;
}

export function updateName(name: string): UserProfile {
    const caller = requireAuth();
    const profile = usersStorage.get(caller);
    
    if (!profile) {
        throw new CanisterError('NOT_FOUND', "User profile not found");
    }
    
    if (!name || name.trim() === '') {
        throw new CanisterError('VALIDATION_ERROR', "Name cannot be empty");
    }
    
    const updatedProfile = {
        ...profile,
        name: name.trim(),
        updatedAt: nowNanos()
    };
    
    usersStorage.insert(caller, updatedProfile);
    
    insertAudit(caller, "update_name", null, caller, `Updated profile name`);
    
    return updatedProfile;
}

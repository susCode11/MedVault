// =============================================================================
// MedVault — ABHA (Ayushman Bharat Health Account) Types
// Workstream 3: Client State & Integration
//
// Consumed by:
//   - useAbha.ts        (Workstream 3)
//   - abha-mock.ts      (Workstream 2 — mock service must return these shapes)
//   - AbhaLinkForm      (Workstream 4 — patient links their ABHA ID)
//   - PatientLookup.tsx (Workstream 4 — doctor searches patient by ABHA ID)
//
// ABHA CONTEXT:
//   ABHA (formerly NDHM Health ID) is India's national health identifier.
//   Format: 14-digit number, displayed as XX-XXXX-XXXX-XXXX.
//   In production, verification calls the NHA (National Health Authority) API.
//   In MedVault, the mock service (abha-mock.ts) simulates these calls.
// =============================================================================

// ---------------------------------------------------------------------------
// ABHA ID Format Utilities
// ---------------------------------------------------------------------------

/** Raw 14-digit string, no dashes. e.g. "12345678901234" */
export type AbhaIdRaw = string;

/** Formatted with dashes: "12-3456-7890-1234" */
export type AbhaIdFormatted = string;

// ---------------------------------------------------------------------------
// Link Status
// ---------------------------------------------------------------------------

/**
 * The current ABHA linking status for the authenticated patient.
 * Stored in UserProfile.abhaId (auth.ts).
 */
export type AbhaLinkStatus =
  | 'unlinked'              // Patient has not linked any ABHA ID
  | 'pending_verification'  // Patient submitted an ID, awaiting OTP/verification
  | 'linked'                // ABHA ID verified and linked to their MedVault profile
  | 'failed';               // Last verification attempt failed

// ---------------------------------------------------------------------------
// Verification
// ---------------------------------------------------------------------------

/**
 * Result of verifying an ABHA ID via abha-mock.ts verifyAbhaId().
 */
export interface AbhaVerificationResult {
  /** Whether the ABHA ID exists and is valid in the NHA registry. */
  isValid: boolean;

  /** Echo of the submitted ABHA ID (raw format). */
  abhaId: AbhaIdRaw;

  /** Patient's full name as registered with NHA. Only if isValid=true. */
  patientName?: string;

  /** Human-readable error if isValid=false. */
  errorMessage?: string;

  /** ISO 8601 timestamp of the verification check. */
  verifiedAt: string;
}

// ---------------------------------------------------------------------------
// Patient Info (from ABHA lookup)
// ---------------------------------------------------------------------------

/**
 * Patient demographic info returned by ABHA ID lookup.
 * Used by doctors in PatientLookup.tsx to identify a patient before
 * requesting record access.
 *
 * NOTE: In production, only a subset of fields are returned without
 * explicit patient consent (PDPA compliance). The mock returns all fields.
 */
export interface AbhaPatientInfo {
  abhaId: AbhaIdRaw;

  /** Full name as registered with NHA. */
  name: string;

  /** ISO 8601 date-only string, e.g. "1985-04-23". */
  dateOfBirth: string;

  gender: 'male' | 'female' | 'other';

  /**
   * Patient's ICP principal (if they have a MedVault account).
   * Null if the patient has an ABHA ID but no MedVault profile yet.
   */
  medvaultPrincipal: string | null;

  /**
   * Whether the patient has a MedVault profile.
   * Derived from `medvaultPrincipal !== null`.
   */
  hasMedvaultProfile: boolean;

  /**
   * SHA-256 hash of the patient's registered phone number.
   * Never expose the raw number — use this for display masking only.
   */
  phoneHash?: string;

  /** State of residence (India), e.g. "Maharashtra". */
  state?: string;
}

// ---------------------------------------------------------------------------
// Search Result (Doctor Portal)
// ---------------------------------------------------------------------------

/**
 * Result returned by useLookupPatient() in the doctor portal.
 * Wraps AbhaPatientInfo with additional MedVault-specific metadata.
 */
export interface AbhaSearchResult {
  patient: AbhaPatientInfo;

  /**
   * Whether the doctor already has an active (approved) access grant
   * for this patient. Lets the UI show "Already has access" state.
   */
  hasExistingAccess: boolean;

  /**
   * Whether there is a pending access request from this doctor to
   * this patient. Lets the UI show "Request pending" state.
   */
  hasPendingRequest: boolean;
}

// ---------------------------------------------------------------------------
// OTP Verification (for linking flow)
// ---------------------------------------------------------------------------

/**
 * Payload for initiating ABHA OTP verification.
 * In production: triggers an OTP SMS to the ABHA-registered phone.
 * In mock: immediately succeeds with a test OTP.
 */
export interface AbhaOtpRequest {
  abhaId: AbhaIdRaw;
}

/**
 * Payload for confirming OTP and completing the ABHA link.
 */
export interface AbhaOtpVerification {
  abhaId: AbhaIdRaw;
  otp: string;
}

/**
 * Result of OTP confirmation.
 */
export interface AbhaLinkResult {
  success: boolean;
  abhaId?: AbhaIdRaw;
  errorMessage?: string;
}

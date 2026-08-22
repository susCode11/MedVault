// =============================================================================
// MedVault — Canister Communication Types
// Workstream 3: Client State & Integration
//
// These are the generic envelope types used by every TanStack Query hook
// to communicate with the Azle backend canister.
//
// Consumed by:
//   - useCanister.ts (Workstream 3) — base hook
//   - All 10 TanStack Query hooks    (Workstream 3)
//   - mockCanister.ts                (Workstream 3)
//
// RESPONSE PATTERN:
//   All canister endpoints return { ok: true, data: T } on success
//   or { ok: false, error: ApiError } on failure.
//   This is a discriminated union — TypeScript narrows automatically.
//
// WORKSTREAM 1 NOTE:
//   The Azle express server should serialise all responses using this shape.
//   The error codes in ApiErrorCode should match what the controllers throw.
// =============================================================================

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

/**
 * Structured error codes — agreed contract between server controllers
 * (Workstream 1) and client hooks (Workstream 3).
 */
export type ApiErrorCode =
  // Auth
  | 'UNAUTHENTICATED'        // No valid identity
  | 'UNAUTHORIZED'           // Authenticated but not allowed
  | 'SESSION_EXPIRED'        // Delegation has expired

  // Resource
  | 'NOT_FOUND'              // Requested resource does not exist
  | 'ALREADY_EXISTS'         // Duplicate creation attempt
  | 'CONFLICT'               // State conflict (e.g. already revoked)

  // Validation
  | 'VALIDATION_ERROR'       // Input failed schema validation
  | 'INVALID_PRINCIPAL'      // Malformed ICP principal
  | 'INVALID_ABHA_ID'        // Malformed ABHA health ID

  // Business logic
  | 'ACCESS_DENIED'          // Patient denied doctor's access request
  | 'GRANT_EXPIRED'          // Access grant has passed its expiresAt
  | 'GRANT_REVOKED'          // Access grant was revoked by patient

  // Infrastructure
  | 'IPFS_UPLOAD_FAILED'     // Pinata upload error
  | 'ENCRYPTION_FAILED'      // Lit Protocol error
  | 'CANISTER_ERROR'         // Generic on-chain error
  | 'NETWORK_ERROR'          // Fetch / transport failure
  | 'UNKNOWN_ERROR';         // Catch-all

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  /** Extra structured details, e.g. field-level validation errors. */
  details?: Record<string, string | string[]>;
}

// ---------------------------------------------------------------------------
// Response Envelope
// ---------------------------------------------------------------------------

/**
 * Discriminated union wrapping every canister response.
 *
 * Usage in hooks:
 *   const res = await canister.getRecord(id);
 *   if (!res.ok) throw new Error(res.error.message);
 *   return res.data; // TypeScript knows data: T here
 */
export type CanisterResponse<T> =
  | { ok: true;  data: T }
  | { ok: false; error: ApiError };

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Generic paginated list response.
 * All list endpoints return this shape.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Query params sent to paginated list endpoints.
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  /** ISO 8601 date — return items created after this timestamp. */
  after?: string;
  /** ISO 8601 date — return items created before this timestamp. */
  before?: string;
}

// ---------------------------------------------------------------------------
// Canister Method Signatures
// ---------------------------------------------------------------------------

/**
 * The complete typed interface of the MedVault canister.
 *
 * Workstream 2 (lib/canister.ts) must implement this interface using the
 * generated Candid declarations from `dfx build`.
 *
 * Workstream 3 (hooks + mockCanister.ts) depends on this interface —
 * the mock implements it too, so swapping is seamless.
 *
 * Import types from other type files as needed below.
 */
export interface MedVaultCanister {
  // --- User ---
  /** Register a new user profile on first login. */
  registerUser:    (payload: import('./auth').UserProfile) => Promise<CanisterResponse<import('./auth').UserProfile>>;
  /** Fetch a user profile by principal. */
  getUser:         (principal: string) => Promise<CanisterResponse<import('./auth').UserProfile>>;
  /** Update profile fields (displayName, abhaId, licenseNumber, etc.). */
  updateUser:      (payload: Partial<import('./auth').UserProfile>) => Promise<CanisterResponse<import('./auth').UserProfile>>;

  // --- Records ---
  listRecords:     (params: QueryParams & { category?: string; ownerId?: string }) => Promise<CanisterResponse<PaginatedResponse<import('./records').RecordMetadata>>>;
  getRecord:       (id: string) => Promise<CanisterResponse<import('./records').MedicalRecord>>;
  createRecord:    (payload: Omit<import('./records').MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<CanisterResponse<import('./records').MedicalRecord>>;
  deleteRecord:    (id: string) => Promise<CanisterResponse<{ deleted: true }>>;

  // --- Access ---
  requestAccess:   (payload: import('./access').AccessRequest) => Promise<CanisterResponse<import('./access').AccessGrant>>;
  listGrants:      (params: QueryParams & { role: 'patient' | 'doctor' }) => Promise<CanisterResponse<PaginatedResponse<import('./access').AccessGrant>>>;
  approveGrant:    (payload: import('./access').AccessApprovalPayload) => Promise<CanisterResponse<import('./access').AccessGrant>>;
  denyGrant:       (payload: import('./access').AccessDenialPayload) => Promise<CanisterResponse<import('./access').AccessGrant>>;
  revokeGrant:     (payload: import('./access').AccessDenialPayload) => Promise<CanisterResponse<import('./access').AccessGrant>>;
  getConsentTimeline: (grantId: string) => Promise<CanisterResponse<import('./access').ConsentTimeline>>;

  // --- Emergency ---
  triggerEmergency:    (payload: import('./emergency').EmergencyAccessPayload) => Promise<CanisterResponse<import('./emergency').EmergencyAccessEvent>>;
  listEmergencyEvents: (params: QueryParams & { role: 'patient' | 'doctor' }) => Promise<CanisterResponse<PaginatedResponse<import('./emergency').EmergencyAccessEvent>>>;
  acknowledgeEmergency:(eventId: string) => Promise<CanisterResponse<import('./emergency').EmergencyAccessEvent>>;

  // --- Reports ---
  submitAbuseReport:   (payload: import('./emergency').AbuseReportPayload) => Promise<CanisterResponse<import('./emergency').AbuseReport>>;
  listAbuseReports:    (params: QueryParams) => Promise<CanisterResponse<PaginatedResponse<import('./emergency').AbuseReport>>>;

  // --- Audit / Timeline ---
  listAuditEntries:    (params: QueryParams & { entityId?: string; actorId?: string }) => Promise<CanisterResponse<PaginatedResponse<import('./records').RecordMetadata>>>;
}

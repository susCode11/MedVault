// =============================================================================
// MedVault — Medical Records Types
// Workstream 3: Client State & Integration
//
// Consumed by:
//   - recordStore.ts    (Workstream 3)
//   - useRecords.ts     (Workstream 3)
//   - RecordCard, RecordList, RecordViewer, UploadForm  (Workstream 4)
//   - recordController.ts on the canister  (Workstream 1 must mirror in Candid)
//
// ENCRYPTION MODEL:
//   The file itself is encrypted by Lit Protocol (client/src/lib/lit.ts) before
//   being uploaded to IPFS via Pinata (client/src/lib/pinata.ts).
//   Only the IPFS CID of the *encrypted* blob is stored on the canister,
//   along with the Lit access condition metadata needed to decrypt it.
// =============================================================================

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export type RecordCategory =
  | 'lab_report'
  | 'prescription'
  | 'imaging'          // X-ray, MRI, CT scan
  | 'discharge_summary'
  | 'vaccination'
  | 'insurance'
  | 'other';

/** Human-readable labels for UI display (Workstream 4 can import this). */
export const RECORD_CATEGORY_LABELS: Record<RecordCategory, string> = {
  lab_report:        'Lab Report',
  prescription:      'Prescription',
  imaging:           'Imaging (X-Ray / MRI / CT)',
  discharge_summary: 'Discharge Summary',
  vaccination:       'Vaccination Record',
  insurance:         'Insurance Document',
  other:             'Other',
};

// ---------------------------------------------------------------------------
// Core Record Types
// ---------------------------------------------------------------------------

/**
 * Full medical record — returned to the **owner** (patient) only.
 * Includes the encryption artifacts required for decryption.
 *
 * Workstream 1: mirror as a Candid record in server/lib/types.ts.
 */
export interface MedicalRecord {
  /** UUID — primary key on the canister. */
  id: string;

  /** Principal of the patient who owns this record. */
  ownerId: string;

  title: string;
  category: RecordCategory;
  description: string;

  // --- IPFS / Encryption ---
  /**
   * Content Identifier of the **encrypted** blob on IPFS.
   * Fetch via Pinata, then decrypt via Lit before displaying.
   */
  ipfsCid: string;

  /**
   * The symmetric key encrypted by Lit Protocol.
   * Stored here so Lit can re-encrypt it for newly granted doctors.
   */
  encryptedSymmetricKey: string;

  /**
   * Lit Protocol access conditions — defines who can decrypt.
   * Encoded as a JSON string for canister storage compatibility.
   */
  litAccessConditions: string;

  // --- File metadata ---
  /** SHA-256 hash of the original file for integrity checks. */
  fileHash?: string;

  /** MIME type, e.g. "application/pdf", "image/jpeg" */
  fileType: string;

  /** File size in bytes (of the original, unencrypted file). */
  fileSize: number;

  /** Tags for filtering/search, e.g. ["diabetes", "2024", "Dr. Sharma"]. */
  tags: string[];

  /** Principal of the user who uploaded the record (may differ from owner). */
  uploadedBy: string;

  /** ISO 8601 timestamp string. */
  createdAt: string;

  /** ISO 8601 timestamp string. */
  updatedAt: string;
}

/**
 * Stripped record metadata — returned to **granted doctors**.
 * Does NOT include `encryptedSymmetricKey` or `litAccessConditions`.
 * The doctor must request decryption through Lit Protocol separately.
 */
export type RecordMetadata = Omit<
  MedicalRecord,
  'encryptedSymmetricKey' | 'litAccessConditions'
>;

// ---------------------------------------------------------------------------
// Upload Types
// ---------------------------------------------------------------------------

/**
 * Input payload for uploading a new record.
 * The file is accepted as-is; encryption happens inside useUploadRecord().
 */
export interface UploadPayload {
  file: File;
  title: string;
  category: RecordCategory;
  description: string;
  tags: string[];
}

/**
 * The 4-step encryption + IPFS + canister registration pipeline.
 * Tracked per-file in recordStore.uploadProgress.
 */
export type UploadStep =
  | 'idle'
  | 'hashing'      // Step 0: Hash the original file for integrity checks
  | 'encrypting'   // Step 1: Lit Protocol encrypts the file
  | 'pinning'      // Step 2: Encrypted blob uploaded to IPFS via Pinata
  | 'registering'  // Step 3: CID + metadata registered on the canister
  | 'done'
  | 'error';

/** Per-file upload progress entry stored in recordStore. */
export interface UploadProgress {
  /** Matches the File object's name + size hash — client-side only ID. */
  fileId: string;
  fileName: string;
  /** 0–100 percentage within the current step. */
  progress: number;
  step: UploadStep;
  error?: string;
}

// ---------------------------------------------------------------------------
// Filter & Sort
// ---------------------------------------------------------------------------

export type RecordSortField = 'createdAt' | 'updatedAt' | 'title' | 'fileSize';
export type SortOrder = 'asc' | 'desc';

/**
 * Filter state for the records list view.
 * Stored in recordStore and used as part of the TanStack Query key.
 */
export interface RecordFilter {
  category?: RecordCategory | 'all';
  /** Inclusive date range — ISO 8601 strings. */
  dateRange?: { from: string; to: string };
  /** Full-text search across title, description, tags. */
  searchQuery?: string;
  tags?: string[];
  sortBy: RecordSortField;
  sortOrder: SortOrder;
}

/** Sensible defaults — used to initialise recordStore.filters. */
export const DEFAULT_RECORD_FILTER: RecordFilter = {
  category:    'all',
  searchQuery: '',
  tags:        [],
  sortBy:      'createdAt',
  sortOrder:   'desc',
};

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface RecordPage {
  items: RecordMetadata[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// =============================================================================
// MedVault — useIPFS Hook
// Workstream 3: Client State & Integration
// Phase 4c
//
// Provides Pinata IPFS upload and retrieval operations.
// Used exclusively inside useRecords.ts (Step 2 of upload pipeline).
//
// MOCK MODE:
//   MOCK_PINATA = true  → returns fake CIDs, no real network call
//   MOCK_PINATA = false → delegates to lib/pinata.ts (Workstream 2)
//
// Workstream 2 must implement lib/pinata.ts with the PinataAdapter interface.
// Toggle MOCK_PINATA = false once delivered.
// =============================================================================

import { useCallback, useState } from 'react';

// ---------------------------------------------------------------------------
// Mock flag
// ---------------------------------------------------------------------------

const MOCK_PINATA = true;

// ---------------------------------------------------------------------------
// PinataAdapter interface (W2 must implement in lib/pinata.ts)
// ---------------------------------------------------------------------------

export interface PinataUploadResult {
  /** IPFS Content Identifier of the uploaded blob. */
  cid: string;
  /** Full IPFS gateway URL for retrieval. */
  gatewayUrl: string;
  /** Size in bytes of the uploaded content. */
  size: number;
}

export interface PinataAdapter {
  /** Upload an encrypted blob to IPFS via Pinata. */
  uploadBlob: (
    blob: Blob,
    fileName: string,
    metadata?: Record<string, string>,
    onProgress?: (progressPercentage: number) => void
  ) => Promise<PinataUploadResult>;

  /** Fetch an encrypted blob from IPFS by CID. */
  fetchByCid: (cid: string) => Promise<Blob>;

  /** Unpin a CID (called on record deletion). */
  unpin: (cid: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Mock Pinata Adapter
// ---------------------------------------------------------------------------

const mockPinataAdapter: PinataAdapter = {
  uploadBlob: async (blob, fileName, _metadata, onProgress) => {
    // Simulate Pinata upload latency with progress events
    if (onProgress) onProgress(0);
    await new Promise((r) => setTimeout(r, 200));
    if (onProgress) onProgress(25);
    await new Promise((r) => setTimeout(r, 200));
    if (onProgress) onProgress(50);
    await new Promise((r) => setTimeout(r, 200));
    if (onProgress) onProgress(75);
    await new Promise((r) => setTimeout(r, 200));
    if (onProgress) onProgress(100);

    // Generate deterministic mock CID from file name
    const hash = Array.from(fileName)
      .reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) & 0xffffffff, 0)
      .toString(16)
      .toUpperCase()
      .padStart(8, '0');

    const cid = `QmMOCK${hash}${Date.now().toString(36).toUpperCase()}`;
    return {
      cid,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
      size: blob.size,
    };
  },

  fetchByCid: async (cid) => {
    await new Promise((r) => setTimeout(r, 300));
    const placeholder = `MOCK_IPFS_CONTENT for CID: ${cid}`;
    return new Blob([placeholder], { type: 'application/octet-stream' });
  },

  unpin: async (_cid) => {
    await new Promise((r) => setTimeout(r, 200));
    // No-op in mock
  },
};

// ---------------------------------------------------------------------------
// useIPFS Hook
// ---------------------------------------------------------------------------

/**
 * Provides IPFS upload and retrieval operations via Pinata.
 *
 * Usage (in upload pipeline — Step 2):
 *   const { uploadToIPFS, isUploading } = useIPFS();
 *   const { cid } = await uploadToIPFS(encryptedBlob, record.title);
 *
 * Usage (in record viewer):
 *   const { fetchFromIPFS, isFetching } = useIPFS();
 *   const encryptedBlob = await fetchFromIPFS(record.ipfsCid);
 */
export function useIPFS() {
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching,  setIsFetching]  = useState(false);
  const [isUnpinning, setIsUnpinning] = useState(false);
  const [uploadError, setUploadError] = useState<Error | null>(null);
  const [fetchError,  setFetchError]  = useState<Error | null>(null);

  const adapter: PinataAdapter = MOCK_PINATA
    ? mockPinataAdapter
    : (() => {
        // Real mode: import W2's Pinata adapter
        // import { pinataAdapter } from '../lib/pinata';
        // return pinataAdapter;
        return mockPinataAdapter; // fallback until W2 delivers
      })();

  const uploadToIPFS = useCallback(
    async (
      blob: Blob,
      fileName: string,
      metadata?: Record<string, string>,
      onProgress?: (progressPercentage: number) => void
    ): Promise<PinataUploadResult> => {
      setIsUploading(true);
      setUploadError(null);
      try {
        const result = await adapter.uploadBlob(blob, fileName, metadata, onProgress);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('IPFS upload failed');
        setUploadError(error);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [adapter]
  );

  const fetchFromIPFS = useCallback(
    async (cid: string): Promise<Blob> => {
      setIsFetching(true);
      setFetchError(null);
      try {
        return await adapter.fetchByCid(cid);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('IPFS fetch failed');
        setFetchError(error);
        throw error;
      } finally {
        setIsFetching(false);
      }
    },
    [adapter]
  );

  const unpinFromIPFS = useCallback(
    async (cid: string): Promise<void> => {
      setIsUnpinning(true);
      try {
        await adapter.unpin(cid);
      } finally {
        setIsUnpinning(false);
      }
    },
    [adapter]
  );

  return {
    uploadToIPFS,
    fetchFromIPFS,
    unpinFromIPFS,
    isUploading,
    isFetching,
    isUnpinning,
    uploadError,
    fetchError,
  };
}

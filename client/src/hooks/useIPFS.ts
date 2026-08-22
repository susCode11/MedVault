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

import { uploadEncryptedBlob, fetchFromIPFS as fetchPinata } from '../lib/pinata';

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

// Mock removed as W2 delivered lib/pinata.ts

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

  const adapter: PinataAdapter = {
    uploadBlob: async (blob, fileName, metadata, onProgress) => {
      // lib/pinata doesn't support progress callbacks yet, so we just simulate it instantly
      if (onProgress) onProgress(50);
      const cid = await uploadEncryptedBlob(blob, {
        ownerPrincipal: metadata?.ownerPrincipal || 'unknown',
        fileName,
        ...metadata
      });
      if (onProgress) onProgress(100);
      return {
        cid,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
        size: blob.size,
      };
    },
    fetchByCid: async (cid) => {
      return await fetchPinata(cid);
    },
    unpin: async (_cid) => {
      // W2 did not implement unpin, so this is a no-op for now.
    }
  };

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

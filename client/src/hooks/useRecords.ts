// =============================================================================
// MedVault — useRecords Hook
// Workstream 3: Client State & Integration
// Phase 4d
//
// All medical record operations:
//   - useRecordsList   — paginated, filtered list (patient: own records; doctor: granted records)
//   - useRecord        — single full record (owner only, with encryption artifacts)
//   - useUploadRecord  — 4-step pipeline: encrypt → pin → register → done
//   - useDeleteRecord  — delete + unpin
//   - useViewRecord    — fetch + decrypt blob + create object URL for display
//
// Consumed by (Workstream 4):
//   - RecordList.tsx          — useRecordsList
//   - RecordCard.tsx          — reads from list cache
//   - RecordViewer.tsx        — useRecord + useViewRecord
//   - UploadForm.tsx          — useUploadRecord
//   - EncryptionProgress.tsx  — reads uploadProgress from recordStore
// =============================================================================

import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useCanisterActor, CANISTER_QUERY_KEYS } from './useCanister';
import { useRecordStore } from '../store/recordStore';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useEncryption } from './useEncryption';
import { useIPFS } from './useIPFS';
import { generateFileHash } from '../utils/crypto';
import type { UploadPayload, RecordFilter } from '../types/records';

// ---------------------------------------------------------------------------
// useRecordsList
// ---------------------------------------------------------------------------

const PAGE_SIZE = 12;

/**
 * Paginated, filtered, infinite-scroll list of records.
 * Reads filters from recordStore — no need to pass them manually.
 *
 * Usage:
 *   const { records, isFetching, fetchNextPage, hasNextPage } = useRecordsList();
 */
export function useRecordsList() {
  const { actor, isReady } = useCanisterActor();
  const principal = useAuthStore((s) => s.principal);
  const filters   = useRecordStore((s) => s.filters);

  const query = useInfiniteQuery({
    queryKey: CANISTER_QUERY_KEYS.records.list(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const res = await actor.listRecords({
        ownerId:  principal ?? undefined,
        category: filters.category === 'all' ? undefined : filters.category,
        page:     pageParam as number,
        pageSize: PAGE_SIZE,
      });
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.page + 1 : undefined,
    enabled: isReady && !!principal,
    staleTime: 30_000,
  });

  // Flatten pages into a single array for consumption
  const records = query.data?.pages.flatMap((p) => p.items) ?? [];
  const total   = query.data?.pages[0]?.total ?? 0;

  return {
    records,
    total,
    isFetching:      query.isFetching,
    isLoading:       query.isLoading,
    isError:         query.isError,
    error:           query.error,
    fetchNextPage:   query.fetchNextPage,
    hasNextPage:     query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch:         query.refetch,
  };
}

// ---------------------------------------------------------------------------
// useRecord (single)
// ---------------------------------------------------------------------------

/**
 * Fetch a single full record (owner only — includes encryption artifacts).
 *
 * Usage:
 *   const { record, isLoading } = useRecord('rec-001');
 */
export function useRecord(recordId: string | null) {
  const { actor, isReady } = useCanisterActor();

  const query = useQuery({
    queryKey: CANISTER_QUERY_KEYS.records.byId(recordId ?? ''),
    queryFn: async () => {
      const res = await actor.getRecord(recordId!);
      if (!res.ok) throw new Error(res.error.message);
      return res.data;
    },
    enabled: isReady && !!recordId,
    staleTime: 60_000,
  });

  return {
    record:    query.data ?? null,
    isLoading: query.isLoading,
    isError:   query.isError,
    error:     query.error,
    refetch:   query.refetch,
  };
}

// ---------------------------------------------------------------------------
// useUploadRecord — 4-step pipeline
// ---------------------------------------------------------------------------

/**
 * Upload a medical record through the complete pipeline:
 *   Step 1 (encrypting)  — Lit Protocol encrypts the file
 *   Step 2 (pinning)     — Encrypted blob uploaded to IPFS via Pinata
 *   Step 3 (registering) — CID + metadata stored on the canister
 *   Step 4 (done)        — Progress entry cleaned up after 2 seconds
 *
 * Progress is tracked in recordStore.uploadProgress for EncryptionProgress.tsx.
 *
 * Usage:
 *   const { uploadRecord, isUploading } = useUploadRecord();
 *   await uploadRecord({ file, title, category, description, tags });
 */
export function useUploadRecord() {
  const { actor, isReady } = useCanisterActor();
  const queryClient        = useQueryClient();
  const principal          = useAuthStore((s) => s.principal);
  const profile            = useAuthStore((s) => s.profile);
  const { encryptFile }    = useEncryption();
  const { uploadToIPFS }   = useIPFS();
  const setProgress        = useRecordStore((s) => s.setUploadProgress);
  const removeProgress     = useRecordStore((s) => s.removeUploadProgress);
  const { success, error: notifyError } = useNotificationStore();

  const mutation = useMutation({
    mutationFn: async (payload: UploadPayload) => {
      if (!principal || !isReady) throw new Error('Not authenticated');

      // Stable file ID from name + size
      const fileId = `${payload.file.name}-${payload.file.size}`;

      try {
        // ── Step 0: Hash ───────────────────────────────────────────────────
        setProgress(fileId, {
          fileName: payload.file.name,
          step: 'hashing',
          progress: 0,
        });
        
        const fileHash = await generateFileHash(payload.file);
        
        setProgress(fileId, { step: 'hashing', progress: 100 });

        // ── Step 1: Encrypt ────────────────────────────────────────────────
        setProgress(fileId, { step: 'encrypting', progress: 0 });

        const { encryptedFile, encryptedSymmetricKey, litAccessConditions } =
          await encryptFile(payload.file);

        setProgress(fileId, { step: 'encrypting', progress: 100 });

        // ── Step 2: Pin to IPFS ────────────────────────────────────────────
        setProgress(fileId, { step: 'pinning', progress: 0 });

        const { cid } = await uploadToIPFS(
          encryptedFile,
          `${payload.title}.enc`,
          { ownerId: principal, category: payload.category },
          (progress) => setProgress(fileId, { step: 'pinning', progress })
        );

        setProgress(fileId, { step: 'pinning', progress: 100 });

        // ── Step 3: Register on canister ───────────────────────────────────
        setProgress(fileId, { step: 'registering', progress: 0 });

        const res = await actor.createRecord({
          ownerId:               principal,
          title:                 payload.title,
          category:              payload.category,
          description:           payload.description,
          ipfsCid:               cid,
          encryptedSymmetricKey,
          litAccessConditions,
          fileType:              payload.file.type || 'application/octet-stream',
          fileSize:              payload.file.size,
          fileHash:              fileHash,
          tags:                  payload.tags,
          uploadedBy:            principal,
        });

        if (!res.ok) throw new Error(res.error.message);

        setProgress(fileId, { step: 'registering', progress: 100 });
        setProgress(fileId, { step: 'done', progress: 100 });

        // ── Step 4: Cleanup ────────────────────────────────────────────────
        setTimeout(() => removeProgress(fileId), 2000);

        return res.data;

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setProgress(fileId, { step: 'error', progress: 0, error: message });
        throw err;
      }
    },
    onSuccess: (record) => {
      // Invalidate the records list so the new record appears
      queryClient.invalidateQueries({ queryKey: CANISTER_QUERY_KEYS.records.lists() });
      success('Upload complete', `"${record.title}" has been encrypted and stored.`);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Upload failed';
      notifyError('Upload failed', message);
    },
  });

  return {
    uploadRecord: mutation.mutateAsync,
    isUploading:  mutation.isPending,
    uploadError:  mutation.error,
  };
}

// ---------------------------------------------------------------------------
// useDeleteRecord
// ---------------------------------------------------------------------------

/**
 * Delete a record from the canister (and unpin from IPFS).
 * Invalidates the records list cache on success.
 */
export function useDeleteRecord() {
  const { actor }        = useCanisterActor();
  const queryClient      = useQueryClient();
  const { unpinFromIPFS } = useIPFS();
  const { success, error: notifyError } = useNotificationStore();

  const mutation = useMutation({
    mutationFn: async ({ id, ipfsCid }: { id: string; ipfsCid: string }) => {
      // Delete from canister first
      const res = await actor.deleteRecord(id);
      if (!res.ok) throw new Error(res.error.message);
      // Best-effort unpin from IPFS
      await unpinFromIPFS(ipfsCid).catch(() => {/* non-fatal */});
      return { id };
    },
    onSuccess: ({ id }) => {
      queryClient.removeQueries({ queryKey: CANISTER_QUERY_KEYS.records.byId(id) });
      queryClient.invalidateQueries({ queryKey: CANISTER_QUERY_KEYS.records.lists() });
      success('Record deleted', 'The record has been permanently removed.');
    },
    onError: (err) => {
      notifyError('Delete failed', err instanceof Error ? err.message : 'Delete failed');
    },
  });

  return {
    deleteRecord: mutation.mutateAsync,
    isDeleting:   mutation.isPending,
    deleteError:  mutation.error,
  };
}

// ---------------------------------------------------------------------------
// useViewRecord — fetch + decrypt → object URL
// ---------------------------------------------------------------------------

/**
 * Fetch and decrypt a medical record, returning a blob URL for display.
 * Manages the object URL lifecycle — cleans up on unmount.
 *
 * Usage:
 *   const { objectUrl, isLoading } = useViewRecord(record);
 *   <iframe src={objectUrl} />
 */
export function useViewRecord(recordId: string | null) {
  const { decryptFile } = useEncryption();
  const { fetchFromIPFS } = useIPFS();
  const { record } = useRecord(recordId);

  const query = useQuery({
    queryKey: ['record-view', recordId],
    queryFn: async () => {
      if (!record) throw new Error('Record not found');

      // Step 1: Fetch encrypted blob from IPFS
      const encryptedBlob = await fetchFromIPFS(record.ipfsCid);

      // Step 2: Decrypt via Lit Protocol
      const decryptedBlob = await decryptFile(
        record.ipfsCid,
        record.encryptedSymmetricKey,
        record.litAccessConditions
      );

      // Step 3: Create object URL for rendering
      const url = URL.createObjectURL(decryptedBlob);
      return { url, mimeType: record.fileType };
    },
    enabled: !!record,
    staleTime: 300_000, // 5 min — object URLs are expensive to create
    gcTime: 300_000,
  });

  useEffect(() => {
    const url = query.data?.url;
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [query.data?.url]);

  return {
    objectUrl:  query.data?.url ?? null,
    mimeType:   query.data?.mimeType ?? null,
    isLoading:  query.isLoading,
    isError:    query.isError,
    error:      query.error,
  };
}

// ---------------------------------------------------------------------------
// useRecordFilters — convenience hook for RecordFilter.tsx
// ---------------------------------------------------------------------------

/**
 * Read and write record filters without importing recordStore directly.
 * Changing filters automatically invalidates the records list query.
 */
export function useRecordFilters() {
  const filters     = useRecordStore((s) => s.filters);
  const setFilter   = useRecordStore((s) => s.setFilter);
  const resetFilters = useRecordStore((s) => s.resetFilters);
  const viewMode    = useRecordStore((s) => s.viewMode);
  const setViewMode = useRecordStore((s) => s.setViewMode);
  const queryClient = useQueryClient();

  const updateFilter = useCallback(
    (partial: Partial<RecordFilter>) => {
      setFilter(partial);
      queryClient.invalidateQueries({ queryKey: CANISTER_QUERY_KEYS.records.lists() });
    },
    [setFilter, queryClient]
  );

  const reset = useCallback(() => {
    resetFilters();
    queryClient.invalidateQueries({ queryKey: CANISTER_QUERY_KEYS.records.lists() });
  }, [resetFilters, queryClient]);

  return { filters, updateFilter, resetFilters: reset, viewMode, setViewMode };
}

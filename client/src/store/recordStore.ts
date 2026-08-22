// =============================================================================
// MedVault — Record Store
// Workstream 3: Client State & Integration
//
// Manages CLIENT-SIDE UI state for the records view.
// This store does NOT hold the records data itself — that lives in the
// TanStack Query cache managed by useRecords.ts.
//
// This store owns:
//   - Filter/sort settings for the records list
//   - View mode (grid vs list)
//   - Multi-select state for batch operations
//   - Per-file upload pipeline progress (4-step: encrypt → pin → register → done)
//   - The currently previewed record (modal open state)
//
// Consumed by (Workstream 4):
//   - RecordFilter.tsx       — reads/writes filters
//   - RecordList.tsx         — reads viewMode, selectedRecordIds
//   - RecordCard.tsx         — reads selectedRecordIds for checkbox state
//   - UploadForm.tsx         — writes uploadProgress via setUploadProgress()
//   - EncryptionProgress.tsx — reads uploadProgress for progress bars
//   - RecordViewer.tsx       — reads/writes previewRecord
//
// Consumed by (Workstream 3 hooks):
//   - useRecords.ts          — reads filters as part of TanStack Query key
//   - useUploadRecord (in useRecords.ts) — writes uploadProgress at each step
//
// ⚠️  CONFLICT MITIGATION:
//   uploadProgress is a Record<string, UploadProgress>, NOT a Map<>.
//   Zustand persist cannot serialize ES6 Map objects.
//   All access MUST go through setUploadProgress() / removeUploadProgress().
//   W4 must NEVER directly mutate state.uploadProgress.
// =============================================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MedicalRecord, RecordFilter, UploadProgress } from '../types/records';
import { DEFAULT_RECORD_FILTER } from '../types/records';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ViewMode = 'grid' | 'list';

interface RecordState {
  /** Active filter/sort criteria. Used as part of TanStack Query cache key. */
  filters: RecordFilter;

  /** Card grid or compact list layout. */
  viewMode: ViewMode;

  /**
   * IDs of records selected for batch operations (download, share, delete).
   * String[] not Set<string> — Zustand persist cannot serialize Set.
   */
  selectedRecordIds: string[];

  /**
   * Per-file upload pipeline state.
   * Key: fileId (client-generated hash of file name + size).
   * Value: UploadProgress tracking the 4-step pipeline.
   */
  uploadProgress: Record<string, UploadProgress>;

  /**
   * The record currently open in the preview/viewer modal.
   * Null = modal is closed.
   */
  previewRecord: MedicalRecord | null;
}

interface RecordActions {
  // --- Filters ---

  /** Merge a partial filter update into current filters. */
  setFilter: (partial: Partial<RecordFilter>) => void;

  /** Reset all filters and sort back to DEFAULT_RECORD_FILTER. */
  resetFilters: () => void;

  // --- Selection ---

  /**
   * Toggle a single record's selection state.
   * If the id is already selected, it is removed. Otherwise it is added.
   */
  toggleRecordSelection: (id: string) => void;

  /** Replace the entire selection with a new list of ids. */
  selectAll: (ids: string[]) => void;

  /** Clear the entire selection. */
  clearSelection: () => void;

  // --- View Mode ---

  setViewMode: (mode: ViewMode) => void;

  // --- Upload Progress ---

  /**
   * Create or update a file's upload progress entry.
   * If `fileId` does not exist yet, a new entry is created.
   * If it exists, the provided `update` is merged (shallow) into it.
   *
   * ⚠️  W4: use this action exclusively. Never mutate state.uploadProgress directly.
   */
  setUploadProgress: (fileId: string, update: Partial<UploadProgress>) => void;

  /**
   * Remove a file's progress entry.
   * Call this after status reaches 'done' or 'error' and the UI has
   * acknowledged the final state (e.g. after a 2-second delay).
   */
  removeUploadProgress: (fileId: string) => void;

  /** Remove all upload progress entries. Called on logout. */
  clearUploadProgress: () => void;

  // --- Preview ---

  /**
   * Open a record in the viewer modal.
   * Pass null to close the modal.
   */
  setPreviewRecord: (record: MedicalRecord | null) => void;
}

export type RecordStore = RecordState & RecordActions;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useRecordStore = create<RecordStore>()(
  persist(
    (set, get) => ({
      // --- State ---
      filters: DEFAULT_RECORD_FILTER,
      viewMode: 'grid',
      selectedRecordIds: [],
      uploadProgress: {},
      previewRecord: null,

      // --- Filter Actions ---
      setFilter: (partial) => {
        set((state) => ({
          filters: { ...state.filters, ...partial },
        }));
      },

      resetFilters: () => {
        set({ filters: DEFAULT_RECORD_FILTER });
      },

      // --- Selection Actions ---
      toggleRecordSelection: (id) => {
        set((state) => {
          const exists = state.selectedRecordIds.includes(id);
          return {
            selectedRecordIds: exists
              ? state.selectedRecordIds.filter((sid) => sid !== id)
              : [...state.selectedRecordIds, id],
          };
        });
      },

      selectAll: (ids) => {
        // Deduplicate via Set before storing as array
        set({ selectedRecordIds: [...new Set(ids)] });
      },

      clearSelection: () => {
        set({ selectedRecordIds: [] });
      },

      // --- View Mode ---
      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      // --- Upload Progress ---
      setUploadProgress: (fileId, update) => {
        set((state) => {
          const existing = state.uploadProgress[fileId] ?? {
            fileId,
            fileName: update.fileName ?? fileId,
            progress: 0,
            step: 'idle' as const,
          };
          return {
            uploadProgress: {
              ...state.uploadProgress,
              [fileId]: { ...existing, ...update },
            },
          };
        });
      },

      removeUploadProgress: (fileId) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [fileId]: _removed, ...rest } = state.uploadProgress;
          return { uploadProgress: rest };
        });
      },

      clearUploadProgress: () => {
        set({ uploadProgress: {} });
      },

      // --- Preview ---
      setPreviewRecord: (record) => {
        set({ previewRecord: record });
      },
    }),
    {
      name: 'medvault-records-ui',
      storage: createJSONStorage(() => localStorage),
      // Persist only user preferences — not ephemeral UI state
      partialize: (state) => ({
        filters: state.filters,
        viewMode: state.viewMode,
        // selectedRecordIds, uploadProgress, previewRecord are NOT persisted
      }),
    }
  )
);

// ---------------------------------------------------------------------------
// Derived selectors (use these in components for stable references)
// ---------------------------------------------------------------------------

/** Returns how many records are currently selected. */
export const selectSelectionCount = (state: RecordStore) =>
  state.selectedRecordIds.length;

/** Returns whether a specific record id is selected. */
export const selectIsRecordSelected = (id: string) => (state: RecordStore) =>
  state.selectedRecordIds.includes(id);

/** Returns all in-progress (not done/error) uploads. */
export const selectActiveUploads = (state: RecordStore) =>
  Object.values(state.uploadProgress).filter(
    (p) => p.step !== 'done' && p.step !== 'error' && p.step !== 'idle'
  );

/** Returns count of active uploads (for badge on upload button). */
export const selectActiveUploadCount = (state: RecordStore) =>
  selectActiveUploads(state).length;

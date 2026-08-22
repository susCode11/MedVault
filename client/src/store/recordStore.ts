import { create } from 'zustand';
import { RecordFilter, UploadProgress } from '../types/records';

interface RecordStore {
  filters: RecordFilter;
  selectedRecords: Set<string>;
  uploadProgress: UploadProgress | null;
  viewMode: 'grid' | 'list';
  setFilters: (filters: Partial<RecordFilter>) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  setUploadProgress: (progress: UploadProgress | null) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
}

export const useRecordStore = create<RecordStore>((set) => ({
  filters: {},
  selectedRecords: new Set(),
  uploadProgress: null,
  viewMode: 'grid',

  setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  
  toggleSelection: (id) => set((state) => {
    const newSelection = new Set(state.selectedRecords);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    return { selectedRecords: newSelection };
  }),

  clearSelection: () => set({ selectedRecords: new Set() }),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
}));

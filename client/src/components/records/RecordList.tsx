import React from 'react';
import { MedicalRecord } from '../../types/records';
import { RecordCard } from './RecordCard';
import { FolderOpen } from 'lucide-react';

import { Spinner } from '../ui/Spinner';

interface RecordListProps {
  records: MedicalRecord[];
  isLoading: boolean;
  onRecordClick: (record: MedicalRecord) => void;
  onShareClick?: (record: MedicalRecord) => void;
}

export const RecordList: React.FC<RecordListProps> = ({ records, isLoading, onRecordClick, onShareClick }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-400">Loading records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-dashed border border-surface-border rounded-lg bg-surface-card">
        <div className="w-16 h-16 rounded-full bg-surface-dark flex items-center justify-center mb-4 text-gray-500 border border-surface-border">
          <FolderOpen size={32} />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">No records found</h3>
        <p className="text-sm font-light text-gray-400 max-w-sm leading-relaxed">
          Try adjusting your filters or upload a new medical record to get started.
        </p>
      </div>
    );
  }

  // Currently only implementing grid view for simplicity
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
      {records.map((record) => (
        <RecordCard 
          key={record.id} 
          record={record} 
          onClick={onRecordClick}
          onShare={onShareClick}
        />
      ))}
    </div>
  );
};

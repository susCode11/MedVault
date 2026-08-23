import React, { useEffect } from 'react';
import { RecordList } from '../../components/records/RecordList';
import { RecordFilter } from '../../components/records/RecordFilter';
import { RecordViewer } from '../../components/records/RecordViewer';
import { MedicalRecord } from '../../types/records';
import { useRecordsList, useRecordFilters } from '../../hooks/useRecords';

export const PatientReports: React.FC = () => {
  const { filters, updateFilter } = useRecordFilters();
  const [selectedRecord, setSelectedRecord] = React.useState<MedicalRecord | null>(null);
  const { records = [], isLoading } = useRecordsList();

  useEffect(() => {
    return () => updateFilter({ category: 'all' });
  }, [updateFilter]);

  const filteredRecords = records.filter((r: MedicalRecord) => {
    // category filtering is handled by backend, but we can double check
    if (filters.searchQuery) {
      const search = filters.searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(search) || (r.description?.toLowerCase().includes(search) ?? false);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">My Reports</h1>
        <p className="text-gray-400">All your medical records, securely encrypted in one place.</p>
      </div>

      <RecordFilter />

      <RecordList 
        records={filteredRecords} 
        isLoading={isLoading} 
        onRecordClick={setSelectedRecord}
      />

      <RecordViewer 
        record={selectedRecord} 
        isOpen={!!selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
      />
    </div>
  );
};

import React, { useEffect } from 'react';
import { useRecordStore } from '../../store/recordStore';
import { RecordList } from '../../components/records/RecordList';
import { RecordFilter } from '../../components/records/RecordFilter';
import { RecordViewer } from '../../components/records/RecordViewer';
import { MedicalRecord } from '../../types/records';
import { useRecords } from '../../hooks/useRecords';

export const PatientReports: React.FC = () => {
  const { filters, setFilters } = useRecordStore();
  const [selectedRecord, setSelectedRecord] = React.useState<MedicalRecord | null>(null);
  const { data: records = [], isLoading } = useRecords();

  useEffect(() => {
    return () => setFilters({ category: undefined });
  }, [setFilters]);

  const filteredRecords = records.filter(r => {
    if (filters.category && r.category !== filters.category) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return r.title.toLowerCase().includes(search) || r.description.toLowerCase().includes(search);
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

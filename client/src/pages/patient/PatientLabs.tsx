import React, { useEffect, useState } from 'react';
import { useRecordsList } from '../../hooks/useRecords';
import { RecordList } from '../../components/records/RecordList';
import { RecordViewer } from '../../components/records/RecordViewer';
import { MedicalRecord } from '../../types/records';

export const PatientLabs: React.FC = () => {
  const { records, isLoading, refetch: fetchRecords } = useRecordsList();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle 'scan' by checking against proper MedicalRecord category types if 'scan' is not valid, or just 'imaging'
  const labs = records.filter((r: MedicalRecord) => r.category === 'lab_report' || r.category === 'imaging');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Lab Results & Scans</h1>
        <p className="text-gray-400">Your pathology, radiology, and other diagnostic reports.</p>
      </div>

      <RecordList 
        records={labs} 
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

import React, { useEffect } from 'react';
import { useRecordStore } from '../../store/recordStore';
import { RecordList } from '../../components/records/RecordList';
import { RecordViewer } from '../../components/records/RecordViewer';
import { MedicalRecord } from '../../types/records';

export const PatientPrescriptions: React.FC = () => {
  const { records, isLoading, fetchRecords } = useRecordStore();
  const [selectedRecord, setSelectedRecord] = React.useState<MedicalRecord | null>(null);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const prescriptions = records.filter(r => r.category === 'prescription');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Prescriptions</h1>
        <p className="text-gray-400">Your active and past medication prescriptions.</p>
      </div>

      <RecordList 
        records={prescriptions} 
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

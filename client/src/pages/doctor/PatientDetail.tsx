import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { RecordList } from '../../components/records/RecordList';
import { RecordViewer } from '../../components/records/RecordViewer';
import { MedicalRecord } from '../../types/records';
import { useRecordsList } from '../../hooks/useRecords';
import { useAccessRequest } from '../../hooks/useAccess';
import { useNotificationStore } from '../../store/notificationStore';
import { useState } from 'react';

export const PatientDetail: React.FC = () => {
  const { id } = useParams();
  const { records = [], isFetching: isLoading } = useRecordsList();
  const { requestAccess, isRequesting: isPending } = useAccessRequest();
  const { success, error: notifyError } = useNotificationStore();
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleRecordClick = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewerOpen(true);
  };

  const handleRequestAccess = async () => {
    try {
      await requestAccess({
        patientId: id as string,
        recordIds: [], // Request access to all records
        requestedDurationHours: 24, // Default to 24 hour access
        reason: 'Routine consultation',
      });
      success('Access request sent successfully', 'Your request is pending patient approval.');
    } catch (e) {
      notifyError('Failed to request access', 'An error occurred.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-4">
        <Link to="/doctor/patients">
          <Button variant="ghost" className="p-2 h-auto">
            <ArrowLeft size={24} />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Patient Profile</h1>
          <p className="text-gray-400 font-mono">ID: {id}</p>
        </div>
      </div>

      <div className="bg-warning-500/10 border border-warning-500/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="text-warning-500" />
          <span className="text-warning-200">You may not have full access to this patient's records.</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleRequestAccess} isLoading={isPending}>
          Request Access
        </Button>
      </div>

      {/* Render records if access is granted, otherwise show placeholder */}
      <RecordList records={records} isLoading={isLoading} onRecordClick={handleRecordClick} />

      <RecordViewer 
        record={selectedRecord} 
        isOpen={isViewerOpen} 
        onClose={() => setIsViewerOpen(false)} 
      />
    </div>
  );
};

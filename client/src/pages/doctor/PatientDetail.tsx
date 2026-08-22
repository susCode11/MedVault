import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { RecordList } from '../../components/records/RecordList';

export const PatientDetail: React.FC = () => {
  const { id } = useParams();

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
          <span className="text-warning-200">You do not have access to this patient's records.</span>
        </div>
        <Button variant="warning" size="sm">Request Access</Button>
      </div>

      {/* Render records if access is granted, otherwise show placeholder */}
      <RecordList records={[]} isLoading={false} onRecordClick={() => {}} />
    </div>
  );
};

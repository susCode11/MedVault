import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRecordsList } from '../../hooks/useRecords';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { RecordList } from '../../components/records/RecordList';
import { RecordViewer } from '../../components/records/RecordViewer';
import { AccessGrantModal } from '../../components/access/AccessGrantModal';
import { EmergencyNotification } from '../../components/emergency/EmergencyNotification';
import { MedicalRecord } from '../../types/records';
import { Activity, ShieldAlert, Key, FileText, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccessGrants } from '../../hooks/useAccess';
import { useEmergencyEvents } from '../../hooks/useEmergency';
import type { AccessGrant } from '../../types/access';

export const PatientDashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const { records, isLoading, refetch: fetchRecords } = useRecordsList();
  const [selectedRecord, setSelectedRecord] = React.useState<MedicalRecord | null>(null);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleRecordClick = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsViewerOpen(true);
  };

  const handleShareClick = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setIsShareOpen(true);
  };

  const { grants = [] } = useAccessGrants();
  const { events = [] } = useEmergencyEvents();

  const activeGrantsCount = grants.filter((g: AccessGrant) => !g.revokedAt).length;

  const stats = [
    { label: 'Total Records', value: records.length, icon: <FileText size={24} className="text-primary-400" />, bg: 'bg-primary-500/10' },
    { label: 'Active Access Grants', value: activeGrantsCount, icon: <Key size={24} className="text-accent-400" />, bg: 'bg-accent-500/10' },
    { label: 'Recent Lab Results', value: records.filter((r: MedicalRecord) => r.category === 'lab_report').length, icon: <Activity size={24} className="text-info-400" />, bg: 'bg-info-500/10' },
    { label: 'Emergency Alerts', value: events.length, icon: <ShieldAlert size={24} className="text-danger-400" />, bg: 'bg-danger-500/10' },
  ];

  return (
    <div className="space-y-8">
      <EmergencyNotification />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {profile?.displayName?.split(' ')[0] || 'User'}</h1>
          <p className="text-gray-400">Here's an overview of your medical vault.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsShareOpen(true)} leftIcon={<Key size={18} />}>
            Grant Access
          </Button>
          <Link to="/patient/upload">
            <Button variant="primary" leftIcon={<Plus size={18} />}>
              Upload Record
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Recent Records</h2>
          <Link to="/patient/reports" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
            View All
          </Link>
        </div>
        <RecordList 
          records={records.slice(0, 4)} 
          isLoading={isLoading} 
          onRecordClick={handleRecordClick}
          onShareClick={handleShareClick}
        />
      </div>

      <RecordViewer 
        record={selectedRecord} 
        isOpen={isViewerOpen} 
        onClose={() => setIsViewerOpen(false)} 
      />

      <AccessGrantModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        record={selectedRecord || undefined}
        patientId={profile?.principal || ''}
      />
    </div>
  );
};

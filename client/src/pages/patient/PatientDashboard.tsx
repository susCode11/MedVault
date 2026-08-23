import React from 'react';
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
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

export const PatientDashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const { records, isLoading } = useRecordsList();
  const [selectedRecord, setSelectedRecord] = React.useState<MedicalRecord | null>(null);
  const [isViewerOpen, setIsViewerOpen] = React.useState(false);
  const [isShareOpen, setIsShareOpen] = React.useState(false);

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
    { label: 'Total Records', value: records.length, icon: <FileText size={20} className="text-primary-400" />, bg: 'bg-surface-hover border-surface-border' },
    { label: 'Active Access Grants', value: activeGrantsCount, icon: <Key size={20} className="text-accent-400" />, bg: 'bg-surface-hover border-surface-border' },
    { label: 'Recent Lab Results', value: records.filter((r: MedicalRecord) => r.category === 'lab_report').length, icon: <Activity size={20} className="text-info-400" />, bg: 'bg-surface-hover border-surface-border' },
    { label: 'Emergency Alerts', value: events.length, icon: <ShieldAlert size={20} className="text-danger-400" />, bg: 'bg-surface-hover border-surface-border' },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <EmergencyNotification />

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-2">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-1 tracking-tight">Welcome back, {profile?.displayName?.split(' ')[0] || 'User'}</h1>
          <p className="text-sm text-gray-400 font-light">Here's an overview of your medical vault.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => setIsShareOpen(true)} leftIcon={<Key size={16} />}>
            Grant Access
          </Button>
          <Link to="/patient/upload">
            <Button variant="primary" leftIcon={<Plus size={16} />} className="shadow-none">
              Quick Upload
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Card className="p-4 h-full cursor-pointer sleek-card border-surface-border hover:border-gray-500 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${stat.bg}`}>
                  {React.cloneElement(stat.icon, { size: 16 })}
                </div>
                <div>
                  <p className="text-xs font-light text-gray-400 leading-tight">{stat.label}</p>
                  <p className="text-lg font-semibold text-white leading-tight">{stat.value}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-white">Recent Records</h2>
          <Link to="/patient/reports" className="text-sm text-primary-400 hover:text-primary-300 font-medium">
            View All
          </Link>
        </div>
        <Card className="p-4 bg-surface-card border-surface-border sleek-card">
          <RecordList 
            records={records.slice(0, 4)} 
            isLoading={isLoading} 
            onRecordClick={handleRecordClick}
            onShareClick={handleShareClick}
          />
        </Card>
      </motion.div>

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
    </motion.div>
  );
};

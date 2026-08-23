import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Users, ShieldAlert, Key, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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

export const DoctorDashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  // Fetch real data from canister
  const { grants = [] } = useAccessGrants();
  const { events = [] } = useEmergencyEvents();

  // Calculate unique patients the doctor has access to
  const uniquePatients = new Set(grants.map((g: AccessGrant) => g.patientId)).size;
  const pendingRequests = grants.filter((g: AccessGrant) => !g.revokedAt).length; // Simplify since backend doesn't have status yet
  const emergencyCount = events.length;

  const stats = [
    { label: 'Active Patients', value: uniquePatients.toString(), icon: <Users size={20} className="text-primary-400" />, bg: 'bg-surface-hover border-surface-border', path: '/doctor/patients' },
    { label: 'Access Grants', value: pendingRequests.toString(), icon: <Key size={20} className="text-accent-400" />, bg: 'bg-surface-hover border-surface-border', path: '/doctor/request' },
    { label: 'Emergency Interventions', value: emergencyCount.toString(), icon: <ShieldAlert size={20} className="text-danger-400" />, bg: 'bg-surface-hover border-surface-border', path: '/doctor/emergency' },
    { label: 'Recent Updates', value: '0', icon: <Activity size={20} className="text-info-400" />, bg: 'bg-surface-hover border-surface-border', path: '/doctor/patients' },
  ];

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="mb-2">
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">Welcome, {profile?.displayName || 'Doctor'}</h1>
        <p className="text-sm font-light text-gray-400">Here's your clinic overview for today.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Card 
              className="p-4 h-full cursor-pointer sleek-card border-surface-border hover:border-gray-500 transition-colors group"
              onClick={() => navigate(stat.path)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${stat.bg} group-hover:scale-105 transition-transform`}>
                  {React.cloneElement(stat.icon, { size: 16 })}
                </div>
                <span className="text-lg font-semibold text-white">{stat.value}</span>
              </div>
              <p className="text-xs font-light text-gray-400 leading-tight">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6 min-h-[300px] border border-surface-border hover:border-gray-500 transition-colors sleek-card bg-surface-card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold tracking-tight text-white">Recently Accessed Patients</h2>
            <Link to="/doctor/patients" className="text-sm text-primary-400 hover:text-primary-300">View All</Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 rounded-full bg-surface-dark flex items-center justify-center mb-4 text-gray-500 border border-surface-border">
               <Users size={20} />
             </div>
             <p className="text-sm font-medium text-white mb-1">No patients found</p>
             <p className="text-xs font-light text-gray-400">Search for a patient to get started.</p>
          </div>
        </Card>

        <Card className="p-6 min-h-[300px] border border-surface-border hover:border-gray-500 transition-colors sleek-card bg-surface-card flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold tracking-tight text-white">Access Requests Status</h2>
            <Link to="/doctor/request" className="text-sm text-accent-400 hover:text-accent-300">Manage</Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-12 h-12 rounded-full bg-surface-dark flex items-center justify-center mb-4 text-gray-500 border border-surface-border">
               <Key size={20} />
             </div>
             {grants.length === 0 ? (
               <>
                 <p className="text-sm font-medium text-white mb-1">No pending requests</p>
                 <p className="text-xs font-light text-gray-400">You haven't requested any patient records yet.</p>
               </>
             ) : (
               <>
                 <p className="text-sm font-medium text-white mb-1">{grants.length} access records</p>
                 <p className="text-xs font-light text-gray-400">Check manage for details.</p>
               </>
             )}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

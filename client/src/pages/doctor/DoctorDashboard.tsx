import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { Users, ShieldAlert, Key, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccessGrants } from '../../hooks/useAccess';
import { useEmergencyEvents } from '../../hooks/useEmergency';
import type { AccessGrant } from '../../types/access';

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
    { label: 'Active Patients', value: uniquePatients.toString(), icon: <Users size={24} className="text-primary-400" />, bg: 'bg-primary-500/10', path: '/doctor/patients' },
    { label: 'Access Grants', value: pendingRequests.toString(), icon: <Key size={24} className="text-accent-400" />, bg: 'bg-accent-500/10', path: '/doctor/request' },
    { label: 'Emergency Interventions', value: emergencyCount.toString(), icon: <ShieldAlert size={24} className="text-danger-400" />, bg: 'bg-danger-500/10', path: '/doctor/emergency' },
    { label: 'Recent Updates', value: '0', icon: <Activity size={24} className="text-info-400" />, bg: 'bg-info-500/10', path: '/doctor/patients' },
  ];

  return (
    <div className="space-y-8 animate-scale-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome, {profile?.displayName || 'Doctor'}</h1>
        <p className="text-gray-400">Here's your clinic overview for today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card 
            key={idx} 
            className="p-6 cursor-pointer hover:border-surface-border transition-all group"
            onClick={() => navigate(stat.path)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-400">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Recently Accessed Patients</h2>
            <Link to="/doctor/patients" className="text-sm text-primary-400 hover:text-primary-300">View All</Link>
          </div>
          <div className="text-center text-gray-500 py-12">
            No recently accessed patients. Search for a patient to get started.
          </div>
        </Card>

        <Card className="p-6 min-h-[300px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Access Requests Status</h2>
            <Link to="/doctor/request" className="text-sm text-accent-400 hover:text-accent-300">Manage</Link>
          </div>
          <div className="text-center text-gray-500 py-12">
            {grants.length === 0 ? "No pending access requests." : `${grants.length} access records found.`}
          </div>
        </Card>
      </div>
    </div>
  );
};

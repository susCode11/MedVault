import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useNotificationStore } from '../../../store/notificationStore';
import { useNavigate } from 'react-router-dom';

export const EmergencyNotification: React.FC = () => {
  const { emergencyBannerVisible, dismissBanner } = useNotificationStore();
  const navigate = useNavigate();

  if (!emergencyBannerVisible) return null;

  return (
    <div className="bg-danger-500 text-white px-4 py-3 shadow-lg flex items-center justify-between z-50 rounded-xl mb-6 animate-slide-down">
      <div className="flex items-center space-x-3">
        <AlertTriangle size={24} className="animate-pulse" />
        <div>
          <p className="font-bold text-sm sm:text-base">EMERGENCY ACCESS DETECTED</p>
          <p className="text-xs sm:text-sm text-danger-100">Dr. Sarah Smith accessed your records via Emergency Protocol on {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <button 
          className="text-xs sm:text-sm font-semibold underline hover:text-white/80 whitespace-nowrap"
          onClick={() => navigate('/patient/dashboard')} // Navigate to audit log in real app
        >
          Review & Report
        </button>
        <button onClick={dismissBanner} className="p-1 hover:bg-black/20 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

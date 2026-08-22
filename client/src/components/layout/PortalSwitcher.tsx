import React from 'react';
import { usePortalStore } from '../../../store/portalStore';
import { Shield, Stethoscope } from 'lucide-react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

interface PortalSwitcherProps {
  collapsed?: boolean;
}

export const PortalSwitcher: React.FC<PortalSwitcherProps> = ({ collapsed = false }) => {
  const { activePortal, switchPortal } = usePortalStore();
  const navigate = useNavigate();

  const handleSwitch = (portal: 'patient' | 'doctor') => {
    if (portal === activePortal) return;
    switchPortal(portal);
    navigate(`/${portal}/dashboard`);
  };

  if (collapsed) {
    return (
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => handleSwitch('patient')}
          className={clsx(
            "p-2 rounded-xl transition-all",
            activePortal === 'patient' ? "bg-primary-500/20 text-primary-400 border border-primary-500/30" : "text-gray-500 hover:bg-surface-hover"
          )}
          title="Patient Portal"
        >
          <Shield size={20} />
        </button>
        <button
          onClick={() => handleSwitch('doctor')}
          className={clsx(
            "p-2 rounded-xl transition-all",
            activePortal === 'doctor' ? "bg-accent-500/20 text-accent-400 border border-accent-500/30" : "text-gray-500 hover:bg-surface-hover"
          )}
          title="Doctor Portal"
        >
          <Stethoscope size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface-dark border border-surface-border rounded-xl p-1 flex relative">
      {/* Animated background pill */}
      <div 
        className={clsx(
          "absolute inset-y-1 w-[calc(50%-4px)] rounded-lg transition-transform duration-300 ease-in-out",
          activePortal === 'patient' ? "translate-x-0 bg-primary-500/20 border border-primary-500/30" : "translate-x-full bg-accent-500/20 border border-accent-500/30"
        )}
      />
      
      <button
        onClick={() => handleSwitch('patient')}
        className={clsx(
          "flex-1 flex items-center justify-center py-2 text-sm font-medium z-10 transition-colors rounded-lg",
          activePortal === 'patient' ? "text-primary-400" : "text-gray-400 hover:text-gray-300"
        )}
      >
        <Shield size={16} className="mr-2" />
        Patient
      </button>
      <button
        onClick={() => handleSwitch('doctor')}
        className={clsx(
          "flex-1 flex items-center justify-center py-2 text-sm font-medium z-10 transition-colors rounded-lg",
          activePortal === 'doctor' ? "text-accent-400" : "text-gray-400 hover:text-gray-300"
        )}
      >
        <Stethoscope size={16} className="mr-2" />
        Doctor
      </button>
    </div>
  );
};

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { usePortalStore } from '../../../store/portalStore';
import { PortalSwitcher } from './PortalSwitcher';
import clsx from 'clsx';
import { 
  Activity, FileText, Pill, Beaker, Building2, 
  Settings, Users, Clock, ShieldAlert, Key
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role } = useAuthStore();
  const { activePortal, sidebarCollapsed } = usePortalStore();
  const location = useLocation();

  // Navigation config based on role/portal
  const navItems = activePortal === 'patient' ? [
    { name: 'Dashboard', path: '/patient/dashboard', icon: <Activity size={20} /> },
    { name: 'My Reports', path: '/patient/reports', icon: <FileText size={20} /> },
    { name: 'Prescriptions', path: '/patient/prescriptions', icon: <Pill size={20} /> },
    { name: 'Lab Results', path: '/patient/labs', icon: <Beaker size={20} /> },
    { name: 'Linked Hospitals', path: '/patient/hospitals', icon: <Building2 size={20} /> },
    { name: 'Settings', path: '/patient/settings', icon: <Settings size={20} /> },
  ] : [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: <Activity size={20} /> },
    { name: 'Patient Lookup', path: '/doctor/patients', icon: <Users size={20} /> },
    { name: 'Request Access', path: '/doctor/request', icon: <Key size={20} /> },
    { name: 'Emergency Access', path: '/doctor/emergency', icon: <ShieldAlert size={20} /> },
    { name: 'My Hospital', path: '/doctor/hospital', icon: <Building2 size={20} /> },
  ];

  const controlItems = [
    { name: 'Access Controls', path: '/control/access', icon: <Key size={20} /> },
    { name: 'Consent History', path: '/control/consent', icon: <Clock size={20} /> },
  ];

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-20 flex flex-col glass-card border-l-0 border-y-0 rounded-none transition-all duration-300",
        sidebarCollapsed ? "w-[80px]" : "w-[280px]"
      )}
    >
      <div className="h-20 flex items-center justify-center border-b border-surface-border">
        {sidebarCollapsed ? (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white shadow-glow">
            M
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white shadow-glow">
              M
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              MedVault
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        {role === 'doctor' && (
          <div className={clsx("flex", sidebarCollapsed ? "justify-center" : "")}>
            <PortalSwitcher collapsed={sidebarCollapsed} />
          </div>
        )}

        <div>
          {!sidebarCollapsed && (
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {activePortal === 'patient' ? 'My Health' : 'Clinic Work'}
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary-500/10 text-primary-400 border border-primary-500/20 shadow-[inset_0_0_20px_rgba(0,196,201,0.1)]" 
                    : "text-gray-400 hover:bg-surface-hover hover:text-gray-200"
                )}
              >
                {({ isActive }) => (
                  <>
                    <span className={clsx(
                      "transition-colors",
                      isActive ? "text-primary-400" : "text-gray-500 group-hover:text-gray-400",
                      sidebarCollapsed ? "mx-auto" : "mr-3"
                    )}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && item.name}
                    {isActive && !sidebarCollapsed && (
                      <div className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full shadow-glow" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div>
          {!sidebarCollapsed && (
            <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Privacy & Security
            </p>
          )}
          <nav className="space-y-1">
            {controlItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => clsx(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-accent-500/10 text-accent-400 border border-accent-500/20" 
                    : "text-gray-400 hover:bg-surface-hover hover:text-gray-200"
                )}
              >
                {({ isActive }) => (
                  <>
                    <span className={clsx(
                      "transition-colors",
                      isActive ? "text-accent-400" : "text-gray-500 group-hover:text-gray-400",
                      sidebarCollapsed ? "mx-auto" : "mr-3"
                    )}>
                      {item.icon}
                    </span>
                    {!sidebarCollapsed && item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
};

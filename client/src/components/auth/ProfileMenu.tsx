import React from 'react';
import { Dropdown } from '../ui/Dropdown';
import { useAuthStore } from '../../../store/authStore';
import { Avatar } from '../ui/Avatar';

import { Settings, LogOut, Shield, HeartPulse } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';

export const ProfileMenu: React.FC = () => {
  const { logout, role, principalText } = useAuth();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user && !principalText) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = [
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings size={16} />,
      onClick: () => navigate(`/${role}/settings`),
    },
    {
      id: 'abha',
      label: user?.abhaLinked ? 'ABHA Linked' : 'Link ABHA',
      icon: user?.abhaLinked ? <Shield size={16} className="text-success-400" /> : <HeartPulse size={16} className="text-warning-400" />,
      onClick: () => navigate(`/${role}/settings`),
    },
    { id: 'div1', label: '', divider: true },
    {
      id: 'logout',
      label: 'Sign Out',
      icon: <LogOut size={16} />,
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <Dropdown
      align="right"
      trigger={
        <div className="flex items-center space-x-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-white leading-tight">{user?.displayName || principalText || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize">{role || 'Guest'}</p>
          </div>
          <Avatar 
            name={user?.displayName || 'User'} 
            src={user?.avatarUrl}
            status="online"
            className="ring-2 ring-transparent hover:ring-primary-500/50 transition-all"
          />
        </div>
      }
      items={items}
    />
  );
};

import React, { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon } from 'lucide-react';
import { usePortalStore } from '../../store/portalStore';
import { useNotificationStore } from '../../store/notificationStore';
import { ProfileMenu } from '../auth/ProfileMenu';

export const Header: React.FC = () => {
  const { toggleSidebar, theme, setTheme } = usePortalStore();
  const { info } = useNotificationStore();
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <header className="h-20 flex-shrink-0 flex items-center justify-between px-6 z-10 glass-card mx-6 mt-4 border-surface-border">
      <div className="flex items-center flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 text-gray-400 hover:text-white hover:bg-surface-hover rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="max-w-md w-full relative hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search records, patients, docs..."
            className="w-full bg-surface-dark/50 border border-surface-border text-gray-100 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-gray-400 hover:text-white hover:bg-surface-hover rounded-xl transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <button 
          onClick={() => {
            info('No new notifications', 'You are all caught up!');
            setHasNotifications(false);
          }}
          className="relative p-2 text-gray-400 hover:text-white hover:bg-surface-hover rounded-xl transition-colors"
        >
          <Bell size={20} />
          {hasNotifications && (
            <>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full animate-ping"></span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
            </>
          )}
        </button>
        
        <div className="h-8 w-px bg-surface-border mx-2"></div>
        
        <ProfileMenu />
      </div>
    </header>
  );
};

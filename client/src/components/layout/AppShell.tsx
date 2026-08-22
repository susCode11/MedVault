import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';
import { usePortalStore } from '../../../store/portalStore';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import clsx from 'clsx';

export const AppShell: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuthStore();
  const { sidebarCollapsed } = usePortalStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Don't render shell on public routes
  if (location.pathname === '/' || location.pathname === '/login') {
    return <Outlet />;
  }

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-surface-dark"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" /></div>;
  }

  return (
    <div className="flex h-screen bg-surface-dark text-gray-100 overflow-hidden font-sans">
      <Sidebar />
      <div className={clsx(
        "flex flex-col flex-1 transition-all duration-300 relative",
        sidebarCollapsed ? "ml-[80px]" : "ml-[280px]"
      )}>
        <Header />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-[url('/bg-pattern.svg')] bg-repeat">
          <div className="max-w-7xl mx-auto min-h-full pb-8">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

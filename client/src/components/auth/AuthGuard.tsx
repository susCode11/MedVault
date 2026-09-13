import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { Spinner } from '../ui/Spinner';

import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, profile, isProfileLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-400 font-medium">Verifying identity...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but no profile, ensure they are in the onboarding flow
  const isOnboardingRoute = location.pathname.startsWith('/onboarding') || location.pathname === '/role-select';
  
  if (!isProfileLoading && !profile && !isOnboardingRoute) {
    const pendingRole = sessionStorage.getItem('pendingRole');
    if (pendingRole === 'patient') return <Navigate to="/onboarding/abha" replace />;
    if (pendingRole === 'doctor') return <Navigate to="/onboarding/doctor" replace />;
    return <Navigate to="/login" replace />; // Force them back to choose a role if they don't have one
  }

  // If they have a profile, they shouldn't be in the onboarding flow
  if (!isProfileLoading && profile && isOnboardingRoute) {
    return <Navigate to={`/${profile.role}/dashboard`} replace />;
  }

  return <>{children}</>;
};

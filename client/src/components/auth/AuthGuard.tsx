import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { Spinner } from '../ui/Spinner';

import { useAuth } from '../../hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
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

  return <>{children}</>;
};

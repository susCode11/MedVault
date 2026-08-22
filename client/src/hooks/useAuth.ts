import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Hook for managing authentication state and actions.
 */
export const useAuth = () => {
  const {
    identity,
    principal,
    principalText,
    isAuthenticated,
    isLoading,
    role,
    error,
    initialize,
    loginWithNFID,
    logout,
    setRole,
  } = useAuthStore();

  useEffect(() => {
    // Check for existing session on mount
    initialize();
  }, [initialize]);

  return {
    identity,
    principal,
    principalText,
    isAuthenticated,
    isLoading,
    role,
    error,
    login: loginWithNFID,
    logout,
    setRole,
  };
};

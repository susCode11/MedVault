import React from 'react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';

// TODO (Workstream 4): Replace useAuthStore with useAuth from '../../hooks/useAuth' 
// once Workstream 3 implements the hook.
// import { useAuth } from '../../hooks/useAuth';

export const LoginButton: React.FC = () => {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async () => {
    // For mock purposes, just simulate a login
    // In Workstream 2, this will open the II popup and get the delegation
    await login('mock-principal-12345');
    
    // Check if user has a role, if not send to role select
    const userRole = useAuthStore.getState().role;
    if (!userRole) {
      navigate('/role-select');
    } else {
      navigate(`/${userRole}/dashboard`);
    }
  };

  return (
    <Button 
      size="lg" 
      onClick={handleLogin} 
      isLoading={isLoading}
      leftIcon={<Fingerprint size={24} />}
      className="w-full sm:w-auto shadow-glass hover:shadow-glow-accent transition-all duration-300"
    >
      Login with Internet Identity
    </Button>
  );
};

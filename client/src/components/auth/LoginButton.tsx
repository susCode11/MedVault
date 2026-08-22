import React from 'react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../../store/authStore'; // Keep for getState()
import { useNavigate } from 'react-router-dom';
import { Fingerprint } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

export const LoginButton: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    // Call the real auth hook
    await login({ provider: 'nfid' });
    
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

import React, { useEffect } from 'react';

import { LoginButton } from '../components/auth/LoginButton';
import { LoginWalkthrough } from '../components/auth/LoginWalkthrough';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';


export const Login: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (!role) {
        navigate('/role-select');
      } else {
        navigate(`/${role}/dashboard`);
      }
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated BG elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/20 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-4xl z-10">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-[#ffffff] shadow-glow mx-auto mb-4 text-2xl">
              M
            </div>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4 animate-slide-up">Welcome to MedVault</h1>
          <p className="text-lg text-gray-400 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Your health records, secured by your unique biometrics.
          </p>
        </div>

        {/* Walkthrough Tutorial */}
        <LoginWalkthrough />

        <div className="mt-12 flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <LoginButton />
          
          <div className="text-xs text-gray-500 mt-8 pt-6 border-t border-surface-border w-full max-w-md text-center">
            By logging in, you agree to our <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a> and <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
};

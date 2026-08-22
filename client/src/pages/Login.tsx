import React, { useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { LoginButton } from '../components/auth/LoginButton';
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

      <div className="w-full max-w-md z-10 animate-scale-in">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white shadow-glow mx-auto mb-4 text-2xl">
              M
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to MedVault</h1>
          <p className="text-gray-400">Authenticate securely using Internet Identity.</p>
        </div>

        <Card className="p-8 text-center glass-card border-t border-t-white/10 shadow-2xl">
          <div className="mb-8">
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              MedVault uses biometric authentication (FaceID, TouchID) or security keys via the Internet Computer. No passwords required.
            </p>
            <LoginButton />
          </div>

          <div className="text-xs text-gray-500 mt-6 pt-6 border-t border-surface-border">
            By logging in, you agree to our <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a> and <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>.
          </div>
        </Card>
      </div>
    </div>
  );
};

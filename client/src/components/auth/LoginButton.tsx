import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Fingerprint, ScanFace, KeyRound } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';

type BiometricCapability = 'fingerprint' | 'face' | 'passkey';

/**
 * Detects the device's biometric capability using the Web Authentication API.
 * Returns 'fingerprint' on most Android devices, 'face' on iPhones/iPads,
 * and 'passkey' as a fallback for devices without biometrics.
 */
async function detectBiometricCapability(): Promise<BiometricCapability> {
  try {
    // Check if the device has a platform authenticator (fingerprint/face)
    if (window.PublicKeyCredential &&
        typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (available) {
        // Detect iOS/macOS (Face ID) vs Android/Windows (fingerprint)
        const isAppleDevice = /iPhone|iPad|Macintosh/.test(navigator.userAgent);
        return isAppleDevice ? 'face' : 'fingerprint';
      }
    }
  } catch {
    // WebAuthn not supported — fall back to passkey
  }
  return 'passkey';
}

const BIOMETRIC_CONFIG: Record<BiometricCapability, { icon: React.ReactNode; label: string }> = {
  fingerprint: {
    icon: <Fingerprint size={28} />,
    label: 'Start Fingerprint Scan',
  },
  face: {
    icon: <ScanFace size={28} />,
    label: 'Start Face ID Scan',
  },
  passkey: {
    icon: <KeyRound size={28} />,
    label: 'Start Secure Login',
  },
};

export const LoginButton: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [biometric, setBiometric] = useState<BiometricCapability>('passkey');

  useEffect(() => {
    detectBiometricCapability().then(setBiometric);
  }, []);

  const handleLogin = async () => {
    await login();
    
    const userRole = useAuthStore.getState().role;
    if (!userRole) {
      navigate('/role-select');
    } else {
      navigate(`/${userRole}/dashboard`);
    }
  };

  const config = BIOMETRIC_CONFIG[biometric];

  return (
    <Button 
      size="lg" 
      onClick={handleLogin} 
      isLoading={isLoading}
      leftIcon={config.icon}
      className="w-full sm:w-auto h-16 px-8 text-xl font-bold bg-primary-500 hover:bg-primary-400 text-white shadow-glow hover:shadow-glow-accent transition-all duration-300 animate-pulse hover:animate-none group"
    >
      <span className="group-hover:scale-105 transition-transform">{config.label}</span>
    </Button>
  );
};

import React, { useEffect, useState } from 'react';
import { LoginButton } from '../components/auth/LoginButton';
import { LoginWalkthrough } from '../components/auth/LoginWalkthrough';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, Variants } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, Stethoscope, ChevronLeft } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

export const Login: React.FC = () => {
  const { isAuthenticated, profile, isProfileLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);
  const [step, setStep] = useState<1 | 2>(1); // 1 = Role Select, 2 = II Login
  const { setRole } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (isProfileLoading) return;

      if (!profile) {
        // Look at pending role in session storage
        const pendingRole = sessionStorage.getItem('pendingRole');
        if (pendingRole === 'patient') {
          setRole('patient');
          navigate('/onboarding/abha');
        } else if (pendingRole === 'doctor') {
          setRole('doctor');
          navigate('/onboarding/doctor');
        } else {
          // Fallback if no pending role was found
          setStep(1); 
        }
      } else {
        const pendingRole = sessionStorage.getItem('pendingRole');
        if (pendingRole && pendingRole !== profile.role) {
          useNotificationStore.getState().error(
            'Role Mismatch',
            `This identity is already registered as a ${profile.role}. Please use a different identity for your ${pendingRole} account.`
          );
          useAuthStore.getState().logout();
          sessionStorage.removeItem('pendingRole');
          setStep(1);
          return;
        }
        
        sessionStorage.removeItem('pendingRole');
        navigate(`/${profile.role}/dashboard`);
      }
    }
  }, [isAuthenticated, profile, isProfileLoading, navigate, setRole]);

  const handleContinue = () => {
    if (selectedRole) {
      sessionStorage.setItem('pendingRole', selectedRole);
      setStep(2);
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div 
        className="w-full max-w-4xl z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <Link to="/" className="inline-block">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white mx-auto mb-4 text-xl"
            >
              M
            </motion.div>
          </Link>
          
          {step === 1 ? (
            <>
              <h1 className="text-4xl font-semibold text-white mb-2 tracking-tight">Choose your profile</h1>
              <p className="text-gray-400">How will you be using MedVault?</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-semibold text-white mb-4 tracking-tight">Welcome to MedVault</h1>
              <p className="text-lg text-gray-400 max-w-lg mx-auto font-light">
                Your health records, secured by your unique biometrics.
              </p>
            </>
          )}
        </motion.div>

        {step === 1 && (
          <>
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-3xl mx-auto">
              {/* Patient Card */}
              <motion.div 
                whileHover={{ scale: selectedRole === 'patient' ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('patient')}
                className={clsx(
                  "cursor-pointer transition-opacity duration-200",
                  selectedRole === 'patient' ? "opacity-100" : "opacity-60 hover:opacity-100"
                )}
              >
                <Card className={clsx(
                  "h-full p-8 text-center border transition-colors",
                  selectedRole === 'patient' ? "border-primary-500 bg-surface-hover" : "border-surface-border bg-surface-card"
                )}>
                  <div className={clsx(
                    "w-16 h-16 rounded-xl mx-auto flex items-center justify-center mb-6 transition-colors border",
                    selectedRole === 'patient' ? "bg-primary-600 border-primary-500 text-white" : "bg-surface-dark border-surface-border text-gray-500"
                  )}>
                    <Shield size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Patient</h3>
                  <p className="text-sm text-gray-400 font-light leading-relaxed">Store your medical records securely, manage who has access, and connect your ABHA ID.</p>
                </Card>
              </motion.div>

              {/* Doctor Card */}
              <motion.div 
                whileHover={{ scale: selectedRole === 'doctor' ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedRole('doctor')}
                className={clsx(
                  "cursor-pointer transition-opacity duration-200",
                  selectedRole === 'doctor' ? "opacity-100" : "opacity-60 hover:opacity-100"
                )}
              >
                <Card className={clsx(
                  "h-full p-8 text-center border transition-colors",
                  selectedRole === 'doctor' ? "border-accent-500 bg-surface-hover" : "border-surface-border bg-surface-card"
                )}>
                  <div className={clsx(
                    "w-16 h-16 rounded-xl mx-auto flex items-center justify-center mb-6 transition-colors border",
                    selectedRole === 'doctor' ? "bg-accent-600 border-accent-500 text-white" : "bg-surface-dark border-surface-border text-gray-500"
                  )}>
                    <Stethoscope size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Doctor / Clinic</h3>
                  <p className="text-sm text-gray-400 font-light leading-relaxed">Request access to patient records, write prescriptions, and use emergency break-glass protocols.</p>
                </Card>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-center">
              <Button 
                size="lg" 
                disabled={!selectedRole}
                onClick={handleContinue}
                className="w-full sm:w-auto min-w-[200px]"
              >
                Continue
              </Button>
            </motion.div>
          </>
        )}

        {step === 2 && (
          <>
            <motion.div variants={itemVariants}>
              <LoginWalkthrough />
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center">
              <LoginButton />
              
              <div className="mt-6">
                <Button variant="ghost" onClick={() => setStep(1)} leftIcon={<ChevronLeft size={16} />}>
                  Back to Role Selection
                </Button>
              </div>

              <div className="text-xs text-gray-500 mt-8 pt-6 border-t border-surface-border w-full max-w-md text-center">
                By logging in, you agree to our <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a> and <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>.
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

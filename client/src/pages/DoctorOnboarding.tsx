import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { nmcService, NmcDoctorProfile } from '../lib/nmc-service';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { ShieldAlert, CheckCircle, Stethoscope } from 'lucide-react';
import { useCanisterActor } from '../hooks/useCanister';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export const DoctorOnboarding: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [profile, setProfile] = useState<NmcDoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { principal } = useAuthStore();
  const { registerProfile } = useAuth();
  const { error, success } = useNotificationStore();
  const { actor } = useCanisterActor();
  const queryClient = useQueryClient();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseNumber) return;

    setIsLoading(true);
    try {
      const verifiedProfile = await nmcService.verifyLicense(licenseNumber);
      
      if (verifiedProfile.status !== 'Active') {
        throw new Error(`This license is currently ${verifiedProfile.status}`);
      }
      
      setProfile(verifiedProfile);
      setStep(2);
      success('License Verified', 'Your NMC license is valid and active.');
    } catch (err: any) {
      error('Verification Failed', err.message || 'Could not verify license');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAndLink = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      if (!principal) throw new Error("Not authenticated");
      
      if (actor) {
        try {
          // Register the doctor with their verified NMC profile name
          await registerProfile({
            role: 'doctor',
            displayName: profile.name || 'Doctor',
          });
        } catch (regErr: any) {
          if (!regErr.message?.includes('already registered')) {
            throw regErr;
          }
        }
        
        // Then link their license
        const updateRes = await (actor as any).linkLicenseNumber(profile.licenseNumber);
        if ('error' in updateRes) throw new Error(updateRes.error.message);
        
        // Update local state with the new profile containing the license
        const currentProfile = useAuthStore.getState().profile;
        if (currentProfile) {
          const updatedProfile = {
            ...currentProfile,
            licenseNumber: updateRes.ok.licenseNumber
          };
          useAuthStore.getState().setProfile(updatedProfile);
          
          // Force TanStack Query cache update to prevent stale data overwriting authStore later
          if (principal) {
            queryClient.invalidateQueries({ queryKey: ['users'] });
          }
        }
      } else {
        console.warn("Backend actor not ready, skipping canister update in UI dev mode");
      }

      success('Account Verified', 'You can now access the Doctor Portal.');
      navigate('/doctor/dashboard');
    } catch (err: any) {
      error('Link Failed', err.message || 'Could not link license to your account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogOut = () => {
    useAuthStore.getState().logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-surface-hover border border-surface-border text-accent-400 flex items-center justify-center mx-auto mb-4">
            <Stethoscope size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">Doctor Verification</h1>
          <p className="text-sm text-gray-400 font-light leading-relaxed">
            To ensure patient safety, all doctors must verify their National Medical Commission (NMC) license.
          </p>
        </div>

        <Card className="p-6 relative overflow-hidden sleek-card">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form 
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onSubmit={handleVerify} 
                className="space-y-6"
              >
                <Input
                  label="NMC License Number"
                  placeholder="e.g., DMC/12345 or 12345"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
                <div className="flex flex-col space-y-3">
                  <Button type="submit" isLoading={isLoading} className="w-full" variant="primary">
                    Verify License
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleLogOut} className="w-full text-gray-500">
                    Cancel & Log Out
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 2 && profile && (
              <motion.div 
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <div className="bg-success-500/10 border border-success-500/20 rounded-lg p-4 flex items-start gap-4">
                  <CheckCircle className="text-success-500 mt-1" size={24} />
                  <div>
                    <h3 className="text-white font-semibold mb-1">License Verified</h3>
                    <div className="text-sm text-gray-400 space-y-1 font-light">
                      <p><span className="text-gray-500">Name:</span> {profile.name}</p>
                      <p><span className="text-gray-500">Council:</span> {profile.stateMedicalCouncil}</p>
                      <p><span className="text-gray-500">Year:</span> {profile.registrationYear}</p>
                      <p><span className="text-gray-500">Status:</span> <span className="text-success-400">{profile.status}</span></p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-surface-hover border border-surface-border p-4 rounded-lg flex items-start gap-3">
                  <ShieldAlert className="text-accent-400 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-gray-400 leading-relaxed font-light">
                    By proceeding, you confirm that these details belong to you and agree to MedVault's strict 
                    data access policies. Unauthorized access to patient records is a criminal offense.
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  <Button onClick={handleConfirmAndLink} isLoading={isLoading} className="w-full" variant="primary">
                    Confirm & Access Portal
                  </Button>
                  <Button onClick={() => setStep(1)} variant="ghost" className="w-full" disabled={isLoading}>
                    This is not me
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};

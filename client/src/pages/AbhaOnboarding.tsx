import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { abhaService } from '../lib/abha-service';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { ShieldCheck, Activity } from 'lucide-react';
import { useCanisterActor } from '../hooks/useCanister';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

export const AbhaOnboarding: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [abhaId, setAbhaId] = useState('');
  const [otp, setOtp] = useState('');
  const [txnId, setTxnId] = useState('');
  const [maskedMobile, setMaskedMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { principal } = useAuthStore();
  const { registerProfile } = useAuth(); // Import useAuth hook for registerProfile
  const { error, success } = useNotificationStore();
  const { actor } = useCanisterActor();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaId) return;

    setIsLoading(true);
    try {
      const res = await abhaService.sendOtp(abhaId);
      setTxnId(res.txnId);
      setMaskedMobile(res.maskedMobile);
      setStep(2);
      success('OTP Sent', `An OTP has been sent to ${res.maskedMobile}`);
    } catch (err: any) {
      error('Verification Failed', err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !txnId) return;

    setIsLoading(true);
    try {
      const verifyRes = await abhaService.verifyOtp(txnId, otp);
      
      // Successfully verified. Now link to canister.
      if (!principal) throw new Error("Not authenticated");
      
      if (actor) {
        // Register the user with their verified ABHA profile name
        await registerProfile({
          role: 'patient',
          displayName: verifyRes?.profile?.name || 'ABHA Patient',
          abhaId: abhaId
        });
      } else {
        console.warn("Backend actor not ready, skipping canister update in UI dev mode");
      }

      setStep(3);
      success('ABHA Linked', 'Your ABHA profile has been successfully linked.');
    } catch (err: any) {
      const msg = err.message || 'Failed to verify OTP';
      if (msg.includes('already registered')) {
        success('Welcome Back', 'You are already registered! Loading dashboard...');
        navigate('/patient/dashboard');
      } else {
        error('OTP Invalid', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      if (actor) {
        await registerProfile({ role: 'patient', displayName: 'Patient User' });
      }
      navigate('/patient/dashboard');
    } catch (err: any) {
      error('Registration Failed', err.message);
    }
  };

  const handleFinish = () => {
    // Force a reload of the profile in the store if needed, or just navigate
    navigate('/patient/dashboard');
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
          <div className="w-16 h-16 rounded-xl bg-surface-hover border border-surface-border text-primary-400 flex items-center justify-center mx-auto mb-4">
            <Activity size={32} />
          </div>
          <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">Link Your Health ID</h1>
          <p className="text-sm text-gray-400 font-light leading-relaxed">
            Connect your Ayushman Bharat Health Account (ABHA) to allow doctors to discover your records securely.
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
                onSubmit={handleSendOtp} 
                className="space-y-6"
              >
                <Input
                  label="ABHA Number"
                  placeholder="XX-XXXX-XXXX-XXXX"
                  value={abhaId}
                  onChange={(e) => setAbhaId(e.target.value)}
                  required
                />
                <div className="flex flex-col space-y-3">
                  <Button type="submit" isLoading={isLoading} className="w-full">
                    Send OTP
                  </Button>
                  <Button type="button" variant="ghost" onClick={handleSkip} className="w-full text-gray-500">
                    Skip for now
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form 
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                onSubmit={handleVerifyOtp} 
                className="space-y-6"
              >
                <div className="bg-surface-hover border border-surface-border rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-300 text-center font-light">
                    Enter the 6-digit OTP sent to mobile number ending in <span className="font-semibold text-white">{maskedMobile}</span>
                  </p>
                </div>
                <Input
                  label="Enter OTP"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
                <div className="flex flex-col space-y-3">
                  <Button type="submit" isLoading={isLoading} className="w-full">
                    Verify & Link
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep(1)} className="w-full">
                    Back
                  </Button>
                </div>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-center space-y-6"
              >
                <div className="w-20 h-20 rounded-xl bg-accent-600 text-white flex items-center justify-center mx-auto mb-4 border border-accent-500">
                  <ShieldCheck size={40} />
                </div>
                <h3 className="text-xl font-semibold text-white tracking-tight">Successfully Linked!</h3>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  Your ABHA ID has been securely linked to your MedVault identity. Doctors in the national network can now request access to your records.
                </p>
                <Button onClick={handleFinish} className="w-full">
                  Go to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};

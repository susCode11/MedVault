import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, Stethoscope } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';

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

export const RoleSelect: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | null>(null);
  const { setRole } = useAuthStore();
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selectedRole) {
      setRole(selectedRole);
      if (selectedRole === 'patient') {
        navigate('/onboarding/abha');
      } else if (selectedRole === 'doctor') {
        navigate('/onboarding/doctor');
      } else {
        navigate(`/${selectedRole}/dashboard`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-3xl z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Choose your profile</h1>
          <p className="text-gray-400">How will you be using MedVault?</p>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
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
        
        <motion.div variants={itemVariants} className="flex justify-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => useAuthStore.getState().logout()}
            className="text-gray-400 hover:text-white"
          >
            Logout & Switch Account
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Shield, Stethoscope } from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

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
      <div className="w-full max-w-3xl z-10 animate-slide-up">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Choose your profile</h1>
          <p className="text-gray-400">How will you be using MedVault?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Patient Card */}
          <div 
            onClick={() => setSelectedRole('patient')}
            className={clsx(
              "cursor-pointer transition-all duration-300 transform",
              selectedRole === 'patient' ? "scale-[1.02]" : "hover:scale-[1.02] opacity-70 hover:opacity-100"
            )}
          >
            <Card className={clsx(
              "h-full p-8 text-center border-2",
              selectedRole === 'patient' ? "border-primary-500 bg-primary-500/5 shadow-glow" : "border-transparent"
            )}>
              <div className={clsx(
                "w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 transition-colors",
                selectedRole === 'patient' ? "bg-primary-500 text-[#ffffff]" : "bg-surface-hover text-gray-400"
              )}>
                <Shield size={40} />
              </div>
              <h3 className="text-2xl font-bold text-[#ffffff] mb-3">Patient</h3>
              <p className="text-gray-400">Store your medical records securely, manage who has access, and connect your ABHA ID.</p>
            </Card>
          </div>

          {/* Doctor Card */}
          <div 
            onClick={() => setSelectedRole('doctor')}
            className={clsx(
              "cursor-pointer transition-all duration-300 transform",
              selectedRole === 'doctor' ? "scale-[1.02]" : "hover:scale-[1.02] opacity-70 hover:opacity-100"
            )}
          >
            <Card className={clsx(
              "h-full p-8 text-center border-2",
              selectedRole === 'doctor' ? "border-accent-500 bg-accent-500/5 shadow-glow-accent" : "border-transparent"
            )}>
              <div className={clsx(
                "w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 transition-colors",
                selectedRole === 'doctor' ? "bg-accent-500 text-[#ffffff]" : "bg-surface-hover text-gray-400"
              )}>
                <Stethoscope size={40} />
              </div>
              <h3 className="text-2xl font-bold text-[#ffffff] mb-3">Doctor / Clinic</h3>
              <p className="text-gray-400">Request access to patient records, write prescriptions, and use emergency break-glass protocols.</p>
            </Card>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            variant="primary" 
            disabled={!selectedRole}
            onClick={handleContinue}
            className="w-full sm:w-auto min-w-[200px]"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

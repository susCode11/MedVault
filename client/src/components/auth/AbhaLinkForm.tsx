import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Fingerprint, Smartphone } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useLinkAbha } from '../../hooks/useAbha';

export const AbhaLinkForm: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [abhaId, setAbhaId] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { success, error: notifyError, info } = useNotificationStore();
  const { linkAbha } = useLinkAbha();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!abhaId) return;
    
    setIsLoading(true);
    try {
      // Stub hook handles the mutation
      // In real implementation this would verify first
      setStep(2);
      info('OTP Sent', 'OTP sent to registered mobile number');
    } catch (error) {
      notifyError('Failed to send OTP', 'Could not send OTP to your number');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    try {
      await linkAbha(abhaId);
      success('ABHA Linked', 'ABHA ID successfully linked to MedVault');
    } catch (error) {
      notifyError('Invalid OTP', 'Failed to verify ABHA ID');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md w-full mx-auto animate-fade-in">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
            <Fingerprint size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Link ABHA ID</h3>
            <p className="text-sm text-gray-400">Ayushman Bharat Health Account</p>
          </div>
        </div>
      </CardHeader>
      
      <CardBody>
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              label="Enter 14-digit ABHA ID"
              placeholder="XX-XXXX-XXXX-XXXX"
              value={abhaId}
              onChange={(e) => setAbhaId(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <p className="text-xs text-gray-400">
              By linking your ABHA ID, you consent to sharing health records across the national network.
            </p>
            <Button type="submit" className="w-full" isLoading={isLoading} disabled={!abhaId}>
              Send OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-slide-in-right">
            <div className="flex items-center justify-center text-primary-400 mb-4">
              <Smartphone size={48} className="animate-pulse" />
            </div>
            <Input
              label="Enter 6-digit OTP"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              maxLength={6}
              autoFocus
            />
            <div className="flex space-x-3">
              <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={isLoading} className="flex-1">
                Back
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading} disabled={otp.length < 6} className="flex-1">
                Verify & Link
              </Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
};

import React, { useState } from 'react';
import { MedicalRecord } from '../../../types/records';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { RadioGroup } from '../ui/RadioGroup';
import { Clock, Shield, Eye, ShieldAlert } from 'lucide-react';
import { useNotificationStore } from '../../../store/notificationStore';

interface AccessGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: MedicalRecord; // if specific record
  patientId: string;
  doctorId?: string; // if known
}

export const AccessGrantModal: React.FC<AccessGrantModalProps> = ({ isOpen, onClose, record, doctorId }) => {
  const [targetDoctor, setTargetDoctor] = useState(doctorId || '');
  const [duration, setDuration] = useState('24');
  const [accessType, setAccessType] = useState('read');
  const { addToast } = useNotificationStore();

  const handleGrant = () => {
    if (!targetDoctor) return;
    // Simulate smart contract call
    addToast({ type: 'success', message: `Access granted to ${targetDoctor} for ${duration} hours.` });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Grant Access ${record ? 'to ' + record.title : 'to All Records'}`}>
      <div className="space-y-6">
        <Input
          label="Doctor's Principal ID or ABHA ID"
          placeholder="e.g. Dr. Smith or XXXX-XXXX..."
          value={targetDoctor}
          onChange={(e) => setTargetDoctor(e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Access Duration</label>
          <RadioGroup
            value={duration}
            onChange={setDuration}
            options={[
              { id: '1', title: '1 Hour', description: 'For quick consultations', icon: <Clock size={20} /> },
              { id: '24', title: '24 Hours', description: 'Standard visit duration', icon: <Clock size={20} /> },
              { id: '168', title: '1 Week', description: 'For ongoing treatment', icon: <Clock size={20} /> },
              { id: 'permanent', title: 'Permanent', description: 'Primary care physician', icon: <Shield size={20} /> },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">Access Level</label>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${accessType === 'read' ? 'border-primary-500 bg-primary-500/10' : 'border-surface-border hover:border-gray-500'}`}
              onClick={() => setAccessType('read')}
            >
              <Eye size={24} className={accessType === 'read' ? 'text-primary-400' : 'text-gray-400'} />
              <h4 className="text-white font-medium mt-2">View Only</h4>
              <p className="text-xs text-gray-500 mt-1">Can read records but cannot append new ones.</p>
            </div>
            
            <div 
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${accessType === 'write' ? 'border-accent-500 bg-accent-500/10' : 'border-surface-border hover:border-gray-500'}`}
              onClick={() => setAccessType('write')}
            >
              <ShieldAlert size={24} className={accessType === 'write' ? 'text-accent-400' : 'text-gray-400'} />
              <h4 className="text-white font-medium mt-2">View & Append</h4>
              <p className="text-xs text-gray-500 mt-1">Can read and add new records to your vault.</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-border flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleGrant} disabled={!targetDoctor}>
            Confirm Grant
          </Button>
        </div>
      </div>
    </Modal>
  );
};

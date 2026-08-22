import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface EmergencyFormProps {
  onSubmit: (data: { patientId: string; reason: string; justification: string }) => void;
  onCancel: () => void;
}

export const EmergencyForm: React.FC<EmergencyFormProps> = ({ onSubmit, onCancel }) => {
  const [patientId, setPatientId] = useState('');
  const [reason, setReason] = useState('');
  const [justification, setJustification] = useState('');

  const REASONS = [
    { value: '', label: 'Select primary reason...' },
    { value: 'unconscious', label: 'Patient Unconscious / Unresponsive' },
    { value: 'trauma', label: 'Severe Trauma / Accident' },
    { value: 'cardiac', label: 'Cardiac Arrest / Stroke' },
    { value: 'other', label: 'Other Life-Threatening Condition' },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="bg-danger-500/10 border border-danger-500/30 rounded-xl p-4 mb-6 text-sm text-danger-200">
        <p className="font-semibold text-danger-400 mb-1">WARNING: THIS ACTION IS AUDITED</p>
        <p>Breaking the glass grants you immediate access to all of the patient's records for 24 hours. This event will be permanently recorded on the blockchain and the patient will be notified immediately. Abuse of this system may result in license suspension.</p>
      </div>

      <Input
        label="Patient ABHA ID or Principal ID"
        placeholder="XX-XXXX-XXXX-XXXX"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
      />

      <Select
        label="Primary Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        options={REASONS}
      />

      <Textarea
        label="Medical Justification"
        placeholder="Briefly describe the clinical situation requiring emergency access..."
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        rows={3}
      />

      <div className="flex space-x-3 pt-4">
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={() => onSubmit({ patientId, reason, justification })}
          disabled={!patientId || !reason || !justification}
          className="flex-1"
        >
          Confirm & Access
        </Button>
      </div>
    </div>
  );
};

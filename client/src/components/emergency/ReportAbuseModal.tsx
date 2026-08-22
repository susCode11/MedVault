import React, { useState } from 'react';
import { EmergencyAccessEvent } from '../../../types/emergency';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { ShieldAlert } from 'lucide-react';
import { useNotificationStore } from '../../../store/notificationStore';

interface ReportAbuseModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EmergencyAccessEvent | null;
}

export const ReportAbuseModal: React.FC<ReportAbuseModalProps> = ({ isOpen, onClose, event }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useNotificationStore();

  if (!event) return null;

  const handleSubmit = () => {
    if (!reason) return;
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      addToast({ type: 'success', message: 'Abuse report submitted for investigation.' });
      onClose();
    }, 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Report Emergency Abuse">
      <div className="space-y-6">
        <div className="flex items-start space-x-4 p-4 bg-danger-500/10 border border-danger-500/30 rounded-xl">
          <ShieldAlert size={24} className="text-danger-400 shrink-0 mt-1" />
          <div className="text-sm">
            <h4 className="font-semibold text-danger-400 mb-1">Investigation Notice</h4>
            <p className="text-danger-200">You are reporting the emergency access by <span className="font-semibold text-white">{event.doctorName}</span> on {new Date(event.accessedAt).toLocaleDateString()}. This report will be reviewed by the hospital administration and regulatory bodies.</p>
          </div>
        </div>

        <Textarea
          label="Reason for Report"
          placeholder="Please explain why this emergency access was unauthorized or inappropriate..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
        />

        <div className="pt-4 flex justify-end space-x-3 border-t border-surface-border">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmit} isLoading={isSubmitting} disabled={!reason}>
            Submit Report
          </Button>
        </div>
      </div>
    </Modal>
  );
};

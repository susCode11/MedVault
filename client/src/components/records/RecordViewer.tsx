import React, { useState } from 'react';
import { MedicalRecord } from '../../../types/records';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate, formatFileSize } from '../../../utils/format';
import { Download, Share2, FileText, Shield, Key } from 'lucide-react';
import { CONSTANTS } from '../../../utils/constants';
import { useNotificationStore } from '../../../store/notificationStore';
import { useDownloadRecord } from '../../../hooks/useRecords';

interface RecordViewerProps {
  record: MedicalRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecordViewer: React.FC<RecordViewerProps> = ({ record, isOpen, onClose }) => {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const { addToast } = useNotificationStore();
  const downloadRecord = useDownloadRecord();

  React.useEffect(() => {
    // Reset state when a new record is opened
    setDecryptedUrl(null);
    setIsDecrypting(false);
  }, [record?.id]);

  if (!record) return null;
  const catConfig = CONSTANTS.RECORD_CATEGORIES.find(c => c.id === record.category) || CONSTANTS.RECORD_CATEGORIES[6];

  const handleDecrypt = async () => {
    setIsDecrypting(true);
    try {
      // For now, since hook is a stub, this will just "succeed"
      const blob = await downloadRecord.mutateAsync(record.id);
      
      // For mock, just show a placeholder
      setDecryptedUrl('data:text/html,<h1>Simulated Decrypted Content</h1>');
      addToast({ type: 'success', message: 'Record decrypted successfully' });
    } catch (error) {
      addToast({ type: 'error', message: 'Decryption failed' });
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title={record.title}>
      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* Left side: Viewer */}
        <div className="flex-1 bg-surface-dark border border-surface-border rounded-xl flex items-center justify-center relative overflow-hidden">
          {!decryptedUrl ? (
            <div className="text-center p-8">
              <Shield size={64} className="text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">End-to-End Encrypted</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                This record is stored securely on IPFS and encrypted. You need to decrypt it locally using your access keys.
              </p>
              <Button onClick={handleDecrypt} isLoading={isDecrypting} leftIcon={<Key size={18} />}>
                Decrypt & View
              </Button>
            </div>
          ) : (
            <iframe src={decryptedUrl} className="w-full h-full bg-white" title="Decrypted Document" />
          )}
        </div>

        {/* Right side: Metadata */}
        <div className="w-full lg:w-80 flex flex-col space-y-6 overflow-y-auto pr-2">
          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <Badge variant="primary" className="capitalize">{catConfig.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-white">{formatDate(record.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hospital</span>
                <span className="text-white text-right">{record.hospital || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Size</span>
                <span className="text-white">{formatFileSize(record.fileSize)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</h4>
            <p className="text-sm text-gray-300">{record.description}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {record.tags.map(tag => (
                <Badge key={tag} variant="default">#{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 flex flex-col gap-3">
            <Button variant="outline" className="w-full" leftIcon={<Download size={18} />} disabled={!decryptedUrl}>
              Download File
            </Button>
            <Button variant="primary" className="w-full" leftIcon={<Share2 size={18} />}>
              Manage Access
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

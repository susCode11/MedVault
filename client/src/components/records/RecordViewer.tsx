import React, { useState, useEffect } from 'react';
import { MedicalRecord } from '../../types/records';
import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate, formatFileSize } from '../../utils/format';
import { Download, Share2, Shield, Key } from 'lucide-react';
import { CONSTANTS } from '../../utils/constants';
import { useNotificationStore } from '../../store/notificationStore';
import { useViewRecord } from '../../hooks/useRecords';

interface RecordViewerProps {
  record: MedicalRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecordViewer: React.FC<RecordViewerProps> = ({ record, isOpen, onClose }) => {
  const [shouldDecrypt, setShouldDecrypt] = useState(false);
  const { error: notifyError } = useNotificationStore();
  
  // Only try to decrypt when shouldDecrypt is true
  const { objectUrl, isLoading, isError, error } = useViewRecord(shouldDecrypt ? (record?.id ?? null) : null);

  useEffect(() => {
    // Reset state when a new record is opened or closed
    setShouldDecrypt(false);
  }, [record?.id, isOpen]);

  useEffect(() => {
    if (isError && error) {
      notifyError('Decryption failed', error instanceof Error ? error.message : 'Could not decrypt the record');
      setShouldDecrypt(false);
    }
  }, [isError, error, notifyError]);

  if (!record) return null;
  const catConfig = CONSTANTS.RECORD_CATEGORIES.find(c => c.id === record.category) || CONSTANTS.RECORD_CATEGORIES[6];

  const handleDecrypt = () => {
    setShouldDecrypt(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title={record.title}>
      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* Left side: Viewer */}
        <div className="flex-1 bg-surface-dark border border-surface-border rounded-xl flex items-center justify-center relative overflow-hidden">
          {!objectUrl ? (
            <div className="text-center p-8">
              <Shield size={64} className="text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">End-to-End Encrypted</h3>
              <p className="text-gray-400 max-w-md mx-auto mb-6">
                This record is stored securely on IPFS and encrypted. You need to decrypt it locally using your access keys.
              </p>
              <Button onClick={handleDecrypt} isLoading={isLoading} leftIcon={<Key size={18} />}>
                Decrypt & View
              </Button>
            </div>
          ) : (
            <iframe src={objectUrl} className="w-full h-full bg-white" title="Decrypted Document" />
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
            <Button 
              variant="outline" 
              className="w-full" 
              leftIcon={<Download size={18} />} 
              disabled={!objectUrl}
              onClick={() => {
                if (objectUrl) {
                  const a = document.createElement('a');
                  a.href = objectUrl;
                  // Map some common mimetypes to extensions
                  let ext = '';
                  if (record.fileType === 'application/pdf') ext = '.pdf';
                  else if (record.fileType === 'image/jpeg') ext = '.jpg';
                  else if (record.fileType === 'image/png') ext = '.png';
                  a.download = `${record.title.replace(/\s+/g, '_')}${ext}`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }
              }}
            >
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

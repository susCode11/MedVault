import React, { useState, useRef } from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { UploadCloud, File, X } from 'lucide-react';
import { CONSTANTS } from '../../../utils/constants';
import { formatFileSize } from '../../../utils/format';
import { EncryptionProgress } from './EncryptionProgress';
import { useRecordStore } from '../../../store/recordStore';
import { useNotificationStore } from '../../../store/notificationStore';
import { useUploadRecord } from '../../../hooks/useRecords';

export const UploadForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [hospital, setHospital] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadProgress, setUploadProgress } = useRecordStore();
  const { addToast } = useNotificationStore();
  const uploadRecord = useUploadRecord();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !category) return;
    
    setUploadProgress({ stage: 'encrypting', percent: 10, message: 'Generating symmetric keys...' });
    
    try {
      await uploadRecord.mutateAsync({
        file,
        metadata: { title, description, category, hospital }
      });
      
      setUploadProgress({ stage: 'complete', percent: 100, message: 'Record securely stored.' });
      addToast({ type: 'success', message: 'Medical record uploaded successfully' });
      
      setTimeout(() => {
        setUploadProgress(null);
        setFile(null);
        setTitle('');
        setDescription('');
        setCategory('');
        setHospital('');
      }, 2000);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to upload record' });
      setUploadProgress(null);
    }
  };

  if (uploadProgress) {
    return (
      <Card className="max-w-2xl mx-auto p-8 text-center animate-fade-in">
        <UploadCloud size={64} className="text-primary-500 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-white mb-8">Securing your record</h3>
        <EncryptionProgress progress={uploadProgress} />
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto animate-fade-in">
      <CardHeader>
        <h3 className="text-lg font-semibold text-white">Upload Medical Record</h3>
        <p className="text-sm text-gray-400">All files are end-to-end encrypted before upload.</p>
      </CardHeader>
      
      <CardBody className="space-y-6">
        {!file ? (
          <div 
            className="border-2 border-dashed border-surface-border rounded-xl p-12 flex flex-col items-center justify-center hover:border-primary-500/50 hover:bg-primary-500/5 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
            />
            <UploadCloud size={48} className="text-gray-400 mb-4" />
            <p className="text-white font-medium mb-1">Click or drag file to upload</p>
            <p className="text-sm text-gray-500">PDF, JPG, PNG up to {CONSTANTS.MAX_FILE_SIZE_MB}MB</p>
          </div>
        ) : (
          <div className="bg-surface-dark border border-surface-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-500/20 text-primary-400 rounded-lg">
                <File size={24} />
              </div>
              <div>
                <p className="text-white font-medium text-sm truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
              </div>
            </div>
            <button onClick={() => setFile(null)} className="p-2 text-gray-400 hover:text-danger-400 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Record Title *" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g. Annual Blood Work"
          />
          <Select 
            label="Category *" 
            value={category} 
            onChange={e => setCategory(e.target.value)}
            options={[
              { label: 'Select a category...', value: '' },
              ...CONSTANTS.RECORD_CATEGORIES.map(c => ({ label: c.label, value: c.id }))
            ]}
          />
        </div>
        
        <Input 
          label="Hospital / Clinic" 
          value={hospital} 
          onChange={e => setHospital(e.target.value)} 
          placeholder="Where was this issued?"
        />
        
        <Textarea 
          label="Description & Notes" 
          value={description} 
          onChange={e => setDescription(e.target.value)} 
          placeholder="Add any relevant context for your doctors..."
          rows={3}
        />

        <div className="pt-4 flex justify-end space-x-3">
          <Button variant="ghost">Cancel</Button>
          <Button 
            variant="primary" 
            onClick={handleUpload} 
            disabled={!file || !title || !category || uploadRecord.isPending}
            isLoading={uploadRecord.isPending}
          >
            Encrypt & Upload
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

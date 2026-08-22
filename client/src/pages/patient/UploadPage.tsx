import React from 'react';
import { UploadForm } from '../../components/records/UploadForm';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="p-2 h-auto">
          <ArrowLeft size={24} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Secure Upload</h1>
          <p className="text-gray-400">Encrypt and store a medical record on the blockchain.</p>
        </div>
      </div>

      <UploadForm />
    </div>
  );
};

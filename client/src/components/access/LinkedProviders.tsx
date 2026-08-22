import React from 'react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Building2, XCircle } from 'lucide-react';
import { useNotificationStore } from '../../../store/notificationStore';

export const LinkedProviders: React.FC = () => {
  const { addToast } = useNotificationStore();
  
  // Mock data
  const providers = [
    { id: '1', name: 'Dr. Sarah Smith', type: 'doctor', hospital: 'City General Hospital', status: 'active', expires: '2027-01-01' },
    { id: '2', name: 'Metro Lab Services', type: 'hospital', hospital: 'Diagnostic Center', status: 'active', expires: 'Permanent' },
  ];

  const handleRevoke = (name: string) => {
    addToast({ type: 'warning', message: `Revoked access for ${name}` });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {providers.map(provider => (
        <Card key={provider.id} className="p-4 flex items-center justify-between group">
          <div className="flex items-center space-x-4">
            <Avatar name={provider.name} size="lg" />
            <div>
              <h4 className="font-semibold text-white">{provider.name}</h4>
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <Building2 size={12} className="mr-1" />
                {provider.hospital}
              </div>
              <p className="text-xs text-gray-500 mt-1">Access valid until: {provider.expires}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="opacity-0 group-hover:opacity-100 text-danger-400 hover:bg-danger-500/10 hover:text-danger-300 transition-all p-2"
            onClick={() => handleRevoke(provider.name)}
            title="Revoke Access"
          >
            <XCircle size={20} />
          </Button>
        </Card>
      ))}
    </div>
  );
};

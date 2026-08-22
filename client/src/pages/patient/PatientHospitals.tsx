import React from 'react';
import { LinkedProviders } from '../../components/access/LinkedProviders';
import { Button } from '../../components/ui/Button';
import { Building2, Plus } from 'lucide-react';

export const PatientHospitals: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Linked Hospitals</h1>
          <p className="text-gray-400">Manage healthcare providers that have access to your vault.</p>
        </div>
        <Button variant="primary" leftIcon={<Plus size={18} />}>
          Link New Hospital
        </Button>
      </div>

      <div className="bg-surface-dark border border-surface-border rounded-xl p-8 text-center mt-4">
        <Building2 size={48} className="text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Hospital Integration Network</h3>
        <p className="text-gray-400 max-w-md mx-auto mb-6">
          When you link a hospital, their systems can automatically push new medical records directly to your encrypted vault.
        </p>
      </div>

      <h2 className="text-xl font-bold text-white mt-8 mb-4">Active Links</h2>
      <LinkedProviders />
    </div>
  );
};

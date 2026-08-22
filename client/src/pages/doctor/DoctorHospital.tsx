import React from 'react';
import { Card } from '../../components/ui/Card';
import { Building2, Users } from 'lucide-react';

export const DoctorHospital: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Hospital Network</h1>
        <p className="text-gray-400">Manage your clinical affiliations and shared records.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-8 text-center border border-primary-500/30">
          <Building2 size={48} className="text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">City General Hospital</h3>
          <p className="text-gray-400 mb-4">Primary Affiliation</p>
          <div className="flex justify-center space-x-2">
            <span className="px-3 py-1 bg-success-500/20 text-success-400 rounded-full text-xs">Verified</span>
            <span className="px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs">Write Access</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

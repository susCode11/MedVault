import React from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const DoctorSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Doctor Settings</h1>
        <p className="text-gray-400">Manage your clinical profile and preferences.</p>
      </div>

      <Card className="p-6 max-w-2xl">
        <h3 className="text-xl font-bold text-white mb-6">Professional Details</h3>
        <div className="space-y-4">
          <Input label="Full Name with Title" defaultValue="Dr. Sarah Smith" />
          <Input label="Medical License Number" defaultValue="MED-89234-NY" />
          <Input label="Specialization" defaultValue="Cardiology" />
          <div className="pt-4 border-t border-surface-border">
            <Button variant="primary">Save Changes</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

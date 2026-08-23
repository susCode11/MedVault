import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useNotificationStore } from '../../store/notificationStore';
import { useAuthStore } from '../../store/authStore';
import { useCanisterActor } from '../../hooks/useCanister';

export const DoctorSettings: React.FC = () => {
  const { success, error } = useNotificationStore();
  const { profile, setProfile } = useAuthStore();
  const { actor } = useCanisterActor();
  
  const [name, setName] = useState('');
  const [license, setLicense] = useState('');
  const [specialization, setSpecialization] = useState('General Practice');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.displayName || '');
      setLicense(profile.licenseNumber || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!actor) {
      error('Error', 'Backend not connected.');
      return;
    }
    
    setIsSaving(true);
    try {
      let updatedProfile = { ...profile };
      let hasChanges = false;

      // Update License
      if (license !== profile?.licenseNumber) {
        const updateRes = await (actor as any).linkLicenseNumber(license);
        if ('error' in updateRes) throw new Error(updateRes.error.message);
        updatedProfile.licenseNumber = updateRes.ok.licenseNumber;
        hasChanges = true;
      }

      // Update Name
      if (name !== profile?.displayName) {
        const updateRes = await (actor as any).updateName(name);
        if ('error' in updateRes) throw new Error(updateRes.error.message);
        updatedProfile.displayName = updateRes.ok.name;
        hasChanges = true;
      }
      
      if (hasChanges && profile) {
        setProfile(updatedProfile as any);
      }
      
      success('Profile Updated', 'Your professional information has been saved successfully.');
    } catch (err: any) {
      error('Update Failed', err.message || 'Could not update profile information.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-scale-in">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Doctor Settings</h1>
        <p className="text-gray-400">Manage your clinical profile and preferences.</p>
      </div>

      <Card className="p-6 max-w-2xl">
        <h3 className="text-xl font-bold text-white mb-6">Professional Details</h3>
        <div className="space-y-4">
          <Input 
            label="Full Name with Title" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Dr. Sarah Smith"
          />
          <Input 
            label="Medical License Number" 
            value={license} 
            onChange={(e) => setLicense(e.target.value)} 
            placeholder="e.g. MED-12345"
          />
          <Input 
            label="Specialization" 
            value={specialization} 
            onChange={(e) => setSpecialization(e.target.value)} 
            placeholder="e.g. Cardiology"
          />
          <div className="pt-4 border-t border-surface-border">
            <Button 
              variant="primary" 
              onClick={handleSave}
              isLoading={isSaving}
              disabled={isSaving}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

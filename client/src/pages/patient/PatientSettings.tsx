import React, { useState } from 'react';
import { Tabs } from '../../components/ui/Tabs';
import { Card } from '../../components/ui/Card';
import { AbhaLinkForm } from '../../components/auth/AbhaLinkForm';
import { User, Shield, Bell } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export const PatientSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuthStore();

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={18} /> },
    { id: 'security', label: 'Security & ABHA', icon: <Shield size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your profile, security, and preferences.</p>
      </div>

      <Card className="min-h-[500px]">
        <Tabs tabs={tabs} activeId={activeTab} onChange={setActiveTab} className="px-6" />
        
        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
              <Input label="Full Name" defaultValue={user?.displayName} />
              <Input label="Email Address" type="email" placeholder="Required for notifications" />
              <Input label="Phone Number" type="tel" placeholder="+91" />
              <div className="pt-4 border-t border-surface-border">
                <Button variant="primary">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Internet Identity</h3>
                <div className="bg-surface-dark border border-surface-border rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Principal ID</p>
                    <p className="text-sm text-gray-500 font-mono truncate max-w-xs">{user?.principalId}</p>
                  </div>
                  <Button variant="outline" size="sm">Manage on IC</Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">ABHA Integration</h3>
                {user?.abhaLinked ? (
                  <div className="bg-success-500/10 border border-success-500/30 rounded-xl p-6 text-center">
                    <Shield size={32} className="text-success-400 mx-auto mb-3" />
                    <h4 className="text-white font-medium text-lg">ABHA Successfully Linked</h4>
                    <p className="text-gray-400 text-sm mt-1 mb-4">Your ABHA ID: {user.abhaId}</p>
                    <Button variant="outline" size="sm" className="text-danger-400 border-danger-400/50 hover:bg-danger-500/10">
                      Unlink Account
                    </Button>
                  </div>
                ) : (
                  <AbhaLinkForm />
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-xl animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { title: 'Emergency Access Alerts', desc: 'Get SMS and Email when glass is broken' },
                  { title: 'New Record Uploads', desc: 'When a hospital uploads a new record' },
                  { title: 'Access Expiration', desc: 'When a doctors access is about to expire' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4 p-4 border border-surface-border rounded-xl">
                    <div className="pt-1">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary-500 bg-surface-dark border-surface-border focus:ring-primary-500 focus:ring-offset-surface-dark" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

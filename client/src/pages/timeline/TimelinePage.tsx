import React from 'react';
import { TimelineView } from '../../components/timeline/TimelineView';
import { TimelineEvent } from '../../components/timeline/TimelineCard';

export const TimelinePage: React.FC = () => {
  // Mock data
  const events: TimelineEvent[] = [
    {
      id: '1',
      type: 'record',
      title: 'New Lab Report Uploaded',
      description: 'Comprehensive Blood Count results were securely encrypted and added to your vault.',
      timestamp: Date.now() - 86400000,
      metadata: { hospital: 'City General Hospital' }
    },
    {
      id: '2',
      type: 'access',
      title: 'Access Granted to Dr. Smith',
      description: 'You authorized read-only access to all your records for 24 hours.',
      timestamp: Date.now() - 172800000,
      metadata: { user: 'Dr. Sarah Smith' }
    },
    {
      id: '3',
      type: 'emergency',
      title: 'Emergency Break-Glass',
      description: 'Dr. Wilson bypassed standard consent protocols to access your records during an emergency.',
      timestamp: Date.now() - 5000000000,
      metadata: { hospital: 'Metro Trauma Center' }
    },
    {
      id: '4',
      type: 'system',
      title: 'Vault Initialized',
      description: 'Your MedVault was created and your keys were successfully generated.',
      timestamp: Date.now() - 10000000000,
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Health Timeline</h1>
        <p className="text-gray-400">A complete, chronological history of your healthcare journey.</p>
      </div>

      <div className="bg-surface-dark border border-surface-border rounded-xl p-6 md:p-10">
        <TimelineView events={events} />
      </div>
    </div>
  );
};

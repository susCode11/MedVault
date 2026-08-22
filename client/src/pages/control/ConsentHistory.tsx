import React from 'react';
import { ConsentTimeline } from '../../components/access/ConsentTimeline';

export const ConsentHistory: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Consent History</h1>
        <p className="text-gray-400">A permanent, immutable log of all access changes to your records.</p>
      </div>

      <ConsentTimeline />
    </div>
  );
};

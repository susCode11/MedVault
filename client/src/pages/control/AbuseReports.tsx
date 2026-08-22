import React from 'react';
import { Card } from '../../components/ui/Card';

export const AbuseReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Abuse Reports</h1>
        <p className="text-gray-400">Status of your filed reports against unauthorized access.</p>
      </div>

      <Card className="p-8 text-center text-gray-500">
        You have no filed abuse reports.
      </Card>
    </div>
  );
};

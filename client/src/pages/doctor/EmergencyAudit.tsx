import React from 'react';
import { EmergencyAuditLog } from '../../components/emergency/EmergencyAuditLog';

export const EmergencyAudit: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Emergency Audit Logs</h1>
        <p className="text-gray-400">View and manage emergency interventions.</p>
      </div>

      <div className="sleek-card bg-surface-card border-surface-border p-4">
        <EmergencyAuditLog events={[]} onReportAbuse={() => {}} />
      </div>
    </div>
  );
};

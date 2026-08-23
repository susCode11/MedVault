import React from 'react';
import { useAccessGrants } from '../../hooks/useAccess';
import { Card } from '../../components/ui/Card';

export const DoctorRequestAccess: React.FC = () => {
  const { grants: requests, isLoading } = useAccessGrants({ statusFilter: 'all' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Access Requests</h1>
          <p className="text-gray-400">Track your requests to access patient records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <p className="text-gray-400">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400">No requests found.</p>
        ) : (
          requests.map((req: any) => (
            <Card key={req.id} className="p-4 border-l-4 border-warning-500">
              <h3 className="text-white font-medium mb-1">Patient: {req.patientName}</h3>
              <p className="text-sm text-gray-400 mb-3">Status: <span className="text-warning-400 capitalize">{req.status}</span></p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

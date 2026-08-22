import React from 'react';
import { AccessRequestCard } from '../../components/access/AccessRequestCard';
import { AccessRequest } from '../../types/access';

export const DoctorRequestAccess: React.FC = () => {
  // Mock requests
  const requests: AccessRequest[] = [
    { id: '1', patientId: '91-1234-5678-9012', doctorId: 'dr-smith', status: 'pending', durationHours: 24, reason: 'Follow-up consultation for blood work', accessType: 'read', recordIds: [] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Requests</h1>
        <p className="text-gray-400">Track the status of your requests to view patient records.</p>
      </div>

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map(req => (
            <AccessRequestCard 
              key={req.id} 
              request={req} 
              onApprove={() => {}} 
              onDeny={() => {}} 
              isDoctorView={true} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400">No pending access requests.</p>
        </div>
      )}
    </div>
  );
};

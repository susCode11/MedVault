import React from 'react';
import { AccessRequestCard } from '../../components/access/AccessRequestCard';
import { AccessRequest } from '../../types/access';
import { useAccessRequests } from '../../hooks/useAccess';

export const DoctorRequestAccess: React.FC = () => {
  const { data: requests = [], isLoading } = useAccessRequests('doctor');

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

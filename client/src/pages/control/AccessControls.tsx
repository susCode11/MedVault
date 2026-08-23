import React from 'react';
import { LinkedProviders } from '../../components/access/LinkedProviders';
import { AccessRequestCard } from '../../components/access/AccessRequestCard';
import { AccessGrant } from '../../types/access';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAccessGrants, useGrantActions } from '../../hooks/useAccess';

export const AccessControls: React.FC = () => {
  const { pendingGrants: pendingRequests = [] } = useAccessGrants({ statusFilter: 'all' });
  const { approveGrant, denyGrant } = useGrantActions();

  const handleApprove = async (request: AccessGrant) => {
    await approveGrant({ grantId: request.id, expiresAt: null });
  };

  const handleDeny = async (request: AccessGrant) => {
    await denyGrant({ grantId: request.id });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Access Controls</h1>
        <p className="text-gray-400">Manage who has access to your medical vault.</p>
      </div>

      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          Pending Requests
          {pendingRequests.length > 0 && (
            <span className="ml-3 px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-400 text-xs">
              {pendingRequests.length}
            </span>
          )}
        </h2>
        
        {pendingRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRequests.map((req: AccessGrant) => (
              <AccessRequestCard 
                key={req.id} 
                request={req as any} 
                onApprove={() => handleApprove(req)} 
                onDeny={() => handleDeny(req)} 
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-gray-500">
            No pending access requests.
          </Card>
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Active Access Grants</h2>
          <Button variant="outline" size="sm">Revoke All</Button>
        </div>
        <LinkedProviders />
      </section>
    </div>
  );
};

import React from 'react';
import { Card } from '../ui/Card';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Building2, XCircle } from 'lucide-react';
import { useAccessGrants, useGrantActions } from '../../hooks/useAccess';
import { Loader2 } from 'lucide-react';
import type { AccessGrant } from '../../types/access';

export const LinkedProviders: React.FC = () => {
  const { approvedGrants, isLoading } = useAccessGrants();
  const { revokeGrant, isRevoking } = useGrantActions();

  const handleRevoke = async (grantId: string) => {
    try {
      await revokeGrant({ grantId, reason: 'Patient revoked access' });
    } catch (err) {
      // Notification is handled in the hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (!approvedGrants || approvedGrants.length === 0) {
    return (
      <div className="text-gray-400 py-4">No active linked providers.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {approvedGrants.map((grant: AccessGrant) => (
        <Card key={grant.id} className="p-4 flex items-center justify-between group">
          <div className="flex items-center space-x-4">
            <Avatar name={grant.doctorName} size="lg" />
            <div>
              <h4 className="font-semibold text-white">{grant.doctorName}</h4>
              <div className="flex items-center text-xs text-gray-400 mt-1">
                <Building2 size={12} className="mr-1" />
                Medical Provider
              </div>
              <p className="text-xs text-gray-500 mt-1">Access valid until: {grant.expiresAt ? new Date(Number(grant.expiresAt) / 1000000).toLocaleDateString() : 'Permanent'}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="opacity-0 group-hover:opacity-100 text-danger-400 hover:bg-danger-500/10 hover:text-danger-300 transition-all p-2"
            onClick={() => handleRevoke(grant.id)}
            disabled={isRevoking}
            title="Revoke Access"
          >
            <XCircle size={20} />
          </Button>
        </Card>
      ))}
    </div>
  );
};

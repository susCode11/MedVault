import React from 'react';
import { Card } from '../ui/Card';
import { Check, X, Clock } from 'lucide-react';
import { formatDate } from '../../utils/format';

interface ConsentEvent {
  id: string;
  type: 'granted' | 'revoked' | 'expired';
  doctorName: string;
  timestamp: number;
  details: string;
}

import { useAccessGrants } from '../../hooks/useAccess';
import { Loader2 } from 'lucide-react';
import type { AccessGrant } from '../../types/access';

export const ConsentTimeline: React.FC = () => {
  const { grants, isLoading } = useAccessGrants();

  const events: ConsentEvent[] = [];
  
  if (grants) {
    grants.forEach((grant: AccessGrant) => {
      // Add granted event
      if (grant.status === 'approved' || grant.status === 'revoked' || grant.status === 'expired') {
        events.push({
          id: grant.id + '-granted',
          type: 'granted',
          doctorName: grant.doctorName,
          timestamp: Number(grant.createdAt) / 1_000_000, // convert nano to ms
          details: `Granted access to ${grant.recordIds.length === 0 ? 'All Records' : grant.recordIds.length + ' Records'}`,
        });
      }
      
      // Add revoked event
      if (grant.status === 'revoked' && grant.revokedAt && grant.revokedAt.length > 0) {
        events.push({
          id: grant.id + '-revoked',
          type: 'revoked',
          doctorName: grant.doctorName,
          timestamp: Number(grant.revokedAt[0]) / 1_000_000,
          details: 'Manually revoked access',
        });
      }
    });
    
    // Sort descending by timestamp
    events.sort((a, b) => b.timestamp - a.timestamp);
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'granted': return <Check size={16} className="text-success-500" />;
      case 'revoked': return <X size={16} className="text-danger-500" />;
      case 'expired': return <Clock size={16} className="text-warning-500" />;
      default: return null;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'granted': return 'bg-success-500/20 ring-success-500/30';
      case 'revoked': return 'bg-danger-500/20 ring-danger-500/30';
      case 'expired': return 'bg-warning-500/20 ring-warning-500/30';
      default: return 'bg-gray-500/20 ring-gray-500/30';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Consent Audit Trail</h3>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin text-brand-500" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No consent history found.</div>
      ) : (
        <div className="relative border-l border-surface-border ml-4 space-y-8">
        {events.map((event) => (
          <div key={event.id} className="relative pl-8">
            {/* Timeline Dot */}
            <div className={`absolute -left-3.5 top-1 w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-surface-card ${getColor(event.type)}`}>
              {getIcon(event.type)}
            </div>
            
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="text-white font-medium">{event.doctorName}</h4>
                <span className="text-xs text-gray-500">{formatDate(event.timestamp, 'MMM d, h:mm a')}</span>
              </div>
              <p className="text-sm text-gray-400">{event.details}</p>
            </div>
          </div>
        ))}
        </div>
      )}
    </Card>
  );
};

import React from 'react';
import { Card } from '../ui/Card';
import { formatDate } from '../../utils/format';
import { FileText, ShieldAlert, Key, Activity, HeartPulse } from 'lucide-react';
import clsx from 'clsx';

export interface TimelineEvent {
  id: string;
  type: 'record' | 'access' | 'emergency' | 'system';
  title: string;
  description: string;
  timestamp: number;
  metadata?: any;
}

export const TimelineCard: React.FC<{ event: TimelineEvent }> = ({ event }) => {
  const config = {
    record: { icon: <FileText size={18} />, color: 'primary', bg: 'bg-primary-500/20 text-primary-400' },
    access: { icon: <Key size={18} />, color: 'accent', bg: 'bg-accent-500/20 text-accent-400' },
    emergency: { icon: <ShieldAlert size={18} />, color: 'danger', bg: 'bg-danger-500/20 text-danger-400' },
    system: { icon: <Activity size={18} />, color: 'gray', bg: 'bg-gray-500/20 text-gray-400' },
  }[event.type] || { icon: <HeartPulse size={18} />, color: 'gray', bg: 'bg-gray-500/20 text-gray-400' };

  return (
    <div className="relative pl-8 group">
      {/* Timeline connector dot */}
      <div className={clsx(
        "absolute -left-[18px] top-4 w-[35px] h-[35px] rounded-full flex items-center justify-center ring-4 ring-surface-dark transition-all duration-300",
        config.bg,
        `group-hover:ring-${config.color}-500/30 group-hover:scale-110`
      )}>
        {config.icon}
      </div>

      <Card hover className="p-4 sm:p-5 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-1 h-full bg-${config.color}-500`} />
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
          <h4 className="text-base font-semibold text-white">{event.title}</h4>
          <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
            {formatDate(event.timestamp, 'MMM d, h:mm a')}
          </span>
        </div>
        
        <p className="text-sm text-gray-400">{event.description}</p>
        
        {event.metadata && (
          <div className="mt-3 pt-3 border-t border-surface-border text-xs text-gray-500 flex items-center">
            {event.metadata.user && <span className="mr-3">By: {event.metadata.user}</span>}
            {event.metadata.hospital && <span>Location: {event.metadata.hospital}</span>}
          </div>
        )}
      </Card>
    </div>
  );
};

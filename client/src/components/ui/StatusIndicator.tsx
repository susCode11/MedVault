import React from 'react';
import clsx from 'clsx';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'busy' | 'away' | 'processing';
  label?: string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, className }) => {
  const config = {
    online: { color: 'bg-success-500', pulse: 'bg-success-500/50 animate-ping' },
    offline: { color: 'bg-gray-500', pulse: '' },
    busy: { color: 'bg-danger-500', pulse: 'bg-danger-500/50 animate-ping' },
    away: { color: 'bg-warning-500', pulse: '' },
    processing: { color: 'bg-primary-500', pulse: 'bg-primary-500/50 animate-ping' },
  };

  return (
    <div className={clsx("flex items-center", className)}>
      <div className="relative flex h-3 w-3">
        {config[status].pulse && (
          <span className={clsx("absolute inline-flex h-full w-full rounded-full opacity-75", config[status].pulse)}></span>
        )}
        <span className={clsx("relative inline-flex rounded-full h-3 w-3", config[status].color)}></span>
      </div>
      {label && <span className="ml-2 text-sm text-gray-300 capitalize">{label}</span>}
    </div>
  );
};

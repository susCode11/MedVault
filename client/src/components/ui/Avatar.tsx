import React from 'react';
import clsx from 'clsx';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  status,
  className,
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-500',
    away: 'bg-warning-500',
    busy: 'bg-danger-500',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : null;

  return (
    <div className={clsx('relative inline-block', sizes[size], className)}>
      <div className="w-full h-full rounded-full overflow-hidden bg-surface-hover border border-surface-border flex items-center justify-center">
        {src ? (
          <img src={src} alt={name || 'Avatar'} className="w-full h-full object-cover" />
        ) : initials ? (
          <span className="font-semibold text-gray-300">{initials}</span>
        ) : (
          <User className="text-gray-400 w-1/2 h-1/2" />
        )}
      </div>
      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-surface-dark',
            statusColors[status],
            size === 'sm' ? 'w-2 h-2' : size === 'xl' ? 'w-4 h-4' : 'w-2.5 h-2.5'
          )}
        />
      )}
    </div>
  );
};

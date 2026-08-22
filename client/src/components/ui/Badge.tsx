import React from 'react';
import clsx from 'clsx';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'accent' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  dot = false,
  className,
  ...props
}) => {
  const variants = {
    success: 'bg-success-500/20 text-success-400 border border-success-500/30',
    warning: 'bg-warning-500/20 text-warning-400 border border-warning-500/30',
    danger: 'bg-danger-500/20 text-danger-400 border border-danger-500/30',
    info: 'bg-info-500/20 text-info-400 border border-info-500/30',
    primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
    accent: 'bg-accent-500/20 text-accent-400 border border-accent-500/30',
    default: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
  };

  const dotColors = {
    success: 'bg-success-400',
    warning: 'bg-warning-400',
    danger: 'bg-danger-400',
    info: 'bg-info-400',
    primary: 'bg-primary-400',
    accent: 'bg-accent-400',
    default: 'bg-gray-400',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full mr-1.5', dotColors[variant])} />
      )}
      {children}
    </span>
  );
};

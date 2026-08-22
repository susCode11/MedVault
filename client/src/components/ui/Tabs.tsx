import React from 'react';
import clsx from 'clsx';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeId, onChange, className }) => {
  return (
    <div className={clsx("border-b border-surface-border", className)}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = tab.id === activeId;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={clsx(
                isActive
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500',
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.icon && (
                <span className={clsx("mr-2", isActive ? "text-primary-400" : "text-gray-500 group-hover:text-gray-400")}>
                  {tab.icon}
                </span>
              )}
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

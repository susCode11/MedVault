import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Card } from './Card';

interface DropdownItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'right', className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={clsx(
            'absolute z-50 mt-2 w-56 rounded-xl overflow-hidden animate-scale-in',
            align === 'right' ? 'origin-top-right right-0' : 'origin-top-left left-0',
            className
          )}
        >
          <Card className="py-1 ring-1 ring-black ring-opacity-5">
            {items.map((item, idx) => {
              if (item.divider) {
                return <div key={`div-${idx}`} className="h-px bg-surface-border my-1" />;
              }
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className={clsx(
                    'group flex w-full items-center px-4 py-2 text-sm transition-colors',
                    item.danger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-300 hover:bg-surface-hover hover:text-white'
                  )}
                >
                  {item.icon && <span className="mr-3">{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
};

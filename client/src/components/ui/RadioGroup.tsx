import React from 'react';
import clsx from 'clsx';
import { Card } from './Card';

export interface RadioOption {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ options, value, onChange, className }) => {
  return (
    <div className={clsx("space-y-4", className)}>
      {options.map((opt) => {
        const isSelected = value === opt.id;
        return (
          <div
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className="cursor-pointer"
          >
            <Card
              className={clsx(
                "p-4 transition-all duration-200 border-2",
                isSelected 
                  ? "border-primary-500 bg-primary-500/5 shadow-glow" 
                  : "border-transparent hover:border-gray-500"
              )}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={clsx(
                    "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                    isSelected ? "border-primary-500" : "border-gray-500"
                  )}>
                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
                  </div>
                </div>
                {opt.icon && <div className={clsx("ml-4", isSelected ? "text-primary-400" : "text-gray-400")}>{opt.icon}</div>}
                <div className="ml-4 flex flex-col">
                  <span className={clsx("block text-sm font-medium", isSelected ? "text-white" : "text-gray-300")}>
                    {opt.title}
                  </span>
                  {opt.description && (
                    <span className="block text-sm text-gray-500 mt-1">
                      {opt.description}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { UploadProgress } from '../../types/records';
import { Check, Loader2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface EncryptionProgressProps {
  progress: UploadProgress;
}

export const EncryptionProgress: React.FC<EncryptionProgressProps> = ({ progress }) => {
  const steps = ['hashing', 'encrypting', 'pinning', 'registering'];
  const currentStepIndex = steps.indexOf(progress.step);

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-300 capitalize">
          {progress.step.replace('_', ' ')}
        </span>
        <span className="text-sm font-medium text-white">{Math.round(progress.progress)}%</span>
      </div>
      
      <div className="w-full bg-surface-dark rounded-full h-2.5 mb-6 overflow-hidden">
        <div 
          className={clsx(
            "h-2.5 rounded-full transition-all duration-300",
            progress.step === 'error' ? "bg-danger-500" : "bg-gradient-to-r from-primary-500 to-accent-500"
          )}
          style={{ width: `${progress.progress}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, idx) => {
          const isCompleted = currentStepIndex > idx || progress.step === 'done';
          const isCurrent = currentStepIndex === idx && progress.step !== 'error';
          const isError = progress.step === 'error' && currentStepIndex === idx;

          return (
            <div key={step} className="flex flex-col items-center">
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                isCompleted ? "bg-success-500 border-success-500 text-white" :
                isError ? "bg-danger-500 border-danger-500 text-white" :
                isCurrent ? "border-primary-500 text-white bg-primary-600" :
                "border-surface-border bg-surface-card text-gray-500"
              )}>
                {isCompleted ? <Check size={16} /> :
                 isError ? <AlertCircle size={16} /> :
                 isCurrent ? <Loader2 size={16} className="animate-spin" /> :
                 <span className="text-xs">{idx + 1}</span>}
              </div>
              <span className={clsx(
                "text-xs mt-2 capitalize text-center",
                (isCompleted || isCurrent || isError) ? "text-gray-300" : "text-gray-500"
              )}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
      
      {progress.error && (
        <p className="mt-4 text-sm text-center text-danger-400">
          {progress.error}
        </p>
      )}
    </div>
  );
};

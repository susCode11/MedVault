import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

interface BreakGlassButtonProps {
  onActivate: () => void;
  disabled?: boolean;
}

export const BreakGlassButton: React.FC<BreakGlassButtonProps> = ({ onActivate, disabled }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const HOLD_DURATION = 3000; // 3 seconds to break glass
  const INTERVAL = 50;

  useEffect(() => {
    if (isPressing && !disabled) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (INTERVAL / HOLD_DURATION) * 100;
          if (next >= 100) {
            clearInterval(timerRef.current!);
            onActivate();
            return 100;
          }
          return next;
        });
      }, INTERVAL);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPressing, disabled, onActivate]);

  return (
    <div className="relative inline-block select-none">
      <button
        onMouseDown={() => setIsPressing(true)}
        onMouseUp={() => setIsPressing(false)}
        onMouseLeave={() => setIsPressing(false)}
        onTouchStart={() => setIsPressing(true)}
        onTouchEnd={() => setIsPressing(false)}
        disabled={disabled}
        className={clsx(
          "relative overflow-hidden w-64 h-64 rounded-full border-8 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer outline-none",
          disabled ? "border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed" : 
          isPressing ? "border-danger-600 bg-danger-600 scale-95" : "border-danger-500 bg-surface-dark hover:bg-surface-hover hover:border-danger-400"
        )}
      >
        <div 
          className="absolute inset-0 bg-danger-500 transition-all duration-75 ease-linear opacity-20"
          style={{ height: `${progress}%`, bottom: 0, top: 'auto' }}
        />
        
        <ShieldAlert size={64} className={clsx("mb-4 transition-colors", disabled ? "text-gray-500" : isPressing ? "text-danger-400 animate-pulse" : "text-danger-500")} />
        
        <span className={clsx("font-bold text-xl uppercase tracking-widest", disabled ? "text-gray-500" : "text-white")}>
          Break Glass
        </span>
        <span className={clsx("text-sm mt-2", disabled ? "text-gray-600" : "text-danger-300")}>
          Hold for 3 seconds
        </span>
      </button>

      {/* Progress ring SVG */}
      <svg className="absolute inset-0 w-64 h-64 pointer-events-none transform -rotate-90">
        <circle
          cx="128"
          cy="128"
          r="124"
          fill="none"
          stroke={isPressing ? "#ef4444" : "transparent"}
          strokeWidth="8"
          strokeDasharray={2 * Math.PI * 124}
          strokeDashoffset={2 * Math.PI * 124 * (1 - progress / 100)}
          className="transition-all duration-75 ease-linear"
        />
      </svg>
    </div>
  );
};

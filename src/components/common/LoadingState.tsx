import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading watershed intelligence data...',
  className = '',
}) => {
  return (
    <div
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center flex flex-col items-center justify-center ${className}`}
    >
      <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mb-3" />
      <p className="text-xs font-mono text-slate-400">{message}</p>
    </div>
  );
};

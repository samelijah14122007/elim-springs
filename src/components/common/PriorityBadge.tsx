import React from 'react';
import { CasePriority } from '../../types';

interface PriorityBadgeProps {
  priority: CasePriority | string;
  size?: 'sm' | 'md';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const getStyle = () => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'HIGH':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'MEDIUM':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'LOW':
        return 'bg-slate-800 border-slate-700 text-slate-300';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono font-bold tracking-wider uppercase ${getStyle()} ${padding}`}
    >
      {priority}
    </span>
  );
};

import React from 'react';
import { CaseStatus } from '../../types';

interface StatusBadgeProps {
  status: CaseStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const getStyle = () => {
    switch (status) {
      case 'REPORTED':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400',
          label: 'Reported',
        };
      case 'PENDING_REVIEW':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          label: 'Pending Review',
        };
      case 'FIELD_VERIFICATION_DISPATCHED':
        return {
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          dot: 'bg-orange-400 animate-pulse',
          label: 'Field Dispatched',
        };
      case 'ENGINEER_APPROVED':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Engineer Approved',
        };
      case 'RESOLVED':
        return {
          bg: 'bg-teal-500/10 border-teal-500/30 text-teal-300',
          dot: 'bg-teal-400',
          label: 'Resolved',
        };
      case 'REQUIRES_MORE_EVIDENCE':
        return {
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400',
          label: 'More Evidence Needed',
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          dot: 'bg-slate-400',
          label: status,
        };
    }
  };

  const style = getStyle();
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold tracking-wide uppercase ${style.bg} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      <span>{style.label}</span>
    </span>
  );
};

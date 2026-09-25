import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
  compact = false,
}) => {
  const ActionIcon = action?.icon;

  return (
    <div
      className={`rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center text-center animate-fade-in ${
        compact ? 'p-8' : 'p-12'
      } ${className}`}
    >
      {/* Icon container */}
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mb-4 shadow-inner">
        <Icon className="w-6 h-6 text-slate-500" />
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-200 mb-1.5 tracking-tight">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[13px] text-slate-500 max-w-xs leading-relaxed mb-5">
        {description}
      </p>

      {/* Action */}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all duration-200 shadow-sm shadow-emerald-900/30 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-900/40 cursor-pointer"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

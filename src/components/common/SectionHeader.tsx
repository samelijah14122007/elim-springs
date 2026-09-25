import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  kicker,
  title,
  description,
  icon: Icon,
  iconColor = 'text-emerald-400',
  badge,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-4 ${className}`}>
      <div>
        {kicker && (
          <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-emerald-400 block mb-1">
            {kicker}
          </span>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-sans">
            {title}
          </h2>
          {badge}
        </div>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex-shrink-0 self-start sm:self-center">
          {action}
        </div>
      )}
    </div>
  );
};

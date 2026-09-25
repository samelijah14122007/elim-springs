import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  trend?: {
    value?: string;
    label?: string;
    direction?: 'up' | 'down' | 'neutral';
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  onClick?: () => void;
  className?: string;
  accentBorder?: boolean;
  accentColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  iconColor = 'text-emerald-400',
  iconBg = 'bg-emerald-500/10 border-emerald-500/20',
  trend,
  onClick,
  className = '',
  accentBorder = false,
  accentColor = 'bg-emerald-500',
}) => {
  const Component = onClick ? 'button' : 'div';

  const trendText = trend ? (trend.value || trend.label || '') : '';
  const trendIsNeutral = trend?.isNeutral || trend?.direction === 'neutral';
  const trendIsPositive = trend?.isPositive ?? (trend?.direction === 'up');

  return (
    <Component
      onClick={onClick}
      className={`relative rounded-2xl p-5 bg-slate-900 border ${
        accentBorder
          ? 'border-emerald-500/25 shadow-lg shadow-emerald-950/30'
          : 'border-slate-800'
      } text-left transition-all duration-200 overflow-hidden ${
        onClick
          ? 'hover:border-slate-700 hover:bg-slate-800/80 cursor-pointer hover:shadow-lg hover:shadow-black/30 hover:-translate-y-0.5'
          : ''
      } ${className}`}
    >
      {/* Subtle top-right corner glow for accentBorder cards */}
      {accentBorder && (
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500/8 rounded-full blur-xl pointer-events-none" />
      )}

      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider leading-tight">
          {label}
        </span>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0 ${iconBg}`}
        >
          <Icon className={`w-4.5 h-4.5 ${iconColor}`} />
        </div>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-white tracking-tight leading-none">
          {value}
        </span>
        {subValue && (
          <span className="text-xs text-slate-500 font-medium">
            {subValue}
          </span>
        )}
      </div>

      {trend && trendText && (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={`text-[11px] font-medium ${
              trendIsNeutral
                ? 'text-slate-500'
                : trendIsPositive
                ? 'text-emerald-400'
                : 'text-amber-400'
            }`}
          >
            {trendText}
          </span>
        </div>
      )}
    </Component>
  );
};

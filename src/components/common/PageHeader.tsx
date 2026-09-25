import React from 'react';
import { LucideIcon, ChevronRight } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  moduleNumber?: string;
  module?: string;
  title: string;
  tagline?: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; onClick?: () => void }>;
  actions?: React.ReactNode;
  statusBadge?: React.ReactNode;
  badge?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  iconColor = 'text-emerald-400',
  iconBg = 'bg-emerald-500/10 border-emerald-500/20',
  moduleNumber,
  module,
  title,
  tagline,
  description,
  breadcrumbs,
  actions,
  statusBadge,
  badge,
}) => {
  const modText = module || (moduleNumber ? (moduleNumber.startsWith('MOD') ? moduleNumber : `MOD ${moduleNumber}`) : undefined);
  const descText = tagline || description;
  const badgeElement = statusBadge || badge;

  return (
    <div className="mb-6 pb-5 border-b border-slate-800/60">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1 text-[11px] text-slate-500 mb-3">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-700 flex-shrink-0" />}
              {crumb.onClick ? (
                <button
                  onClick={crumb.onClick}
                  className="hover:text-emerald-400 transition-colors cursor-pointer font-medium"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className={idx === breadcrumbs.length - 1 ? 'text-slate-300 font-semibold' : 'font-medium'}>
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0 shadow-sm ${iconBg}`}
          >
            <Icon className={`w-5.5 h-5.5 ${iconColor}`} />
          </div>

          <div className="min-w-0 pt-0.5">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              {modText && (
                <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/80 tracking-widest">
                  {modText}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                {title}
              </h1>
              {badgeElement}
            </div>

            {descText && (
              <p className="text-[13px] text-slate-400 leading-relaxed max-w-2xl">
                {descText}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0 self-start">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

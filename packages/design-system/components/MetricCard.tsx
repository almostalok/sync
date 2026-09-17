import React from 'react';

interface MetricCardProps {
  id?: string;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  context?: string;
  badge?: string;
  badgeVariant?: 'warning' | 'critical' | 'info' | 'verified';
  onClick?: () => void;
  tooltip?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  label,
  value,
  subtitle,
  trend,
  context,
  badge,
  badgeVariant = 'warning',
  onClick,
  tooltip,
  className = '',
}) => {
  const isClickable = !!onClick;

  return (
    <div
      id={id}
      onClick={onClick}
      title={tooltip}
      className={`bg-white rounded-none border-[1.5px] border-slate-900 shadow-[2px_2px_0px_0px_#0f172a] p-4 transition-all duration-75 relative ${
        isClickable
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
          : ''
      } ${className}`}
    >
      {/* Top Header: Label & Optional Action Badge */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-1.5 mb-2">
        <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest truncate">
          // {label}
        </span>
        {badge && (
          <span
            className={`px-1.5 py-0.5 rounded-none font-mono text-[9px] font-bold uppercase tracking-wider border ${
              badgeVariant === 'warning'
                ? 'bg-amber-100 text-amber-950 border-amber-800'
                : badgeVariant === 'critical'
                ? 'bg-red-100 text-red-950 border-red-800'
                : badgeVariant === 'verified'
                ? 'bg-emerald-100 text-emerald-950 border-emerald-800'
                : 'bg-blue-100 text-blue-950 border-blue-800'
            }`}
          >
            [{badge}]
          </span>
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-2">
        <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-950 font-mono">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-mono font-bold ${
              trend.isNeutral
                ? 'text-slate-500'
                : trend.isPositive
                ? 'text-emerald-800'
                : 'text-red-800'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {/* Supporting Subtitle & Context */}
      {(subtitle || context) && (
        <div className="mt-2 text-xs font-mono text-slate-600 flex flex-col gap-0.5 pt-1.5 border-t border-slate-100">
          {subtitle && <span className="truncate font-medium">{subtitle}</span>}
          {context && <span className="text-[10px] text-slate-500 truncate">{context}</span>}
        </div>
      )}
    </div>
  );
};

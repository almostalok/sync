import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StatusBadge, StatusVariant } from './StatusBadge';

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
  badgeVariant?: StatusVariant;
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
      className={`bg-white rounded-none border-[1.5px] border-slate-900 shadow-[2px_2px_0px_#0f172a] p-4 transition-all duration-75 relative flex flex-col justify-between ${
        isClickable
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#0f172a]'
          : ''
      } ${className}`}
    >
      {/* Top Header: Category Label & Optional Status Pill */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-200">
        <span className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider truncate">
          {label.replace(/^\/\/\s*/, '')}
        </span>
        {badge && (
          <StatusBadge
            status={badgeVariant}
            label={badge.replace(/^\[|\]$/g, '')}
            size="sm"
            showDot={false}
          />
        )}
      </div>

      {/* Main Metric Value & Trend */}
      <div className="flex items-baseline gap-2.5 my-1.5">
        <span className="text-2xl lg:text-3xl font-black tracking-tight text-slate-950 font-mono tabular-nums">
          {value}
        </span>

        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-1.5 py-0.5 border rounded-none ${
              trend.isNeutral
                ? 'bg-stone-100 text-slate-700 border-slate-400'
                : trend.isPositive
                ? 'bg-emerald-100 text-emerald-950 border-emerald-800'
                : 'bg-rose-100 text-rose-950 border-rose-800'
            }`}
          >
            {trend.isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{trend.value}</span>
          </span>
        )}
      </div>

      {/* Supporting Subtitle & Context Footnote */}
      {(subtitle || context) && (
        <div className="mt-2 pt-2 border-t border-slate-200 text-xs font-mono text-slate-600 flex flex-col gap-0.5">
          {subtitle && (
            <span className="truncate font-semibold text-slate-900">
              {subtitle}
            </span>
          )}
          {context && (
            <span className="text-[10px] text-slate-500 truncate">
              {context}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

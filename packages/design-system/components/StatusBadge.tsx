import React from 'react';

export type StatusVariant = 
  | 'verified' 
  | 'completed' 
  | 'on_track' 
  | 'warning' 
  | 'review' 
  | 'at_risk' 
  | 'critical' 
  | 'delayed' 
  | 'info' 
  | 'neutral' 
  | 'unmatched';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  className = '',
}) => {
  const normalized = (status || '').toLowerCase().replace(/[\s-]/g, '_');

  let styleClasses = 'bg-white text-slate-900 border-slate-900';

  if (['verified', 'completed', 'on_track'].includes(normalized)) {
    styleClasses = 'bg-emerald-50 text-emerald-950 border-emerald-800';
  } else if (['warning', 'review', 'review_required', 'pending_review', 'at_risk'].includes(normalized)) {
    styleClasses = 'bg-amber-50 text-amber-950 border-amber-800';
  } else if (['critical', 'delayed', 'failed', 'rejected'].includes(normalized)) {
    styleClasses = 'bg-red-50 text-red-950 border-red-800';
  } else if (['info', 'active', 'auto_linked', 'in_progress'].includes(normalized)) {
    styleClasses = 'bg-blue-50 text-blue-950 border-blue-800';
  } else if (['unmatched'].includes(normalized)) {
    styleClasses = 'bg-slate-100 text-slate-800 border-slate-600';
  }

  const displayLabel = label || status.replace(/_/g, ' ');

  const sizeClass = size === 'sm' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : 'px-2 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold uppercase tracking-wider border rounded-none ${sizeClass} ${styleClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 bg-current shrink-0" />
      <span className="truncate">[{displayLabel}]</span>
    </span>
  );
};

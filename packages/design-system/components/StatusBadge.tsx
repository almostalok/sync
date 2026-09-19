import React from 'react';

export type StatusVariant = 
  | 'verified' 
  | 'completed' 
  | 'on_track' 
  | 'warning' 
  | 'review' 
  | 'review_required'
  | 'pending_review'
  | 'at_risk' 
  | 'critical' 
  | 'delayed' 
  | 'info' 
  | 'active'
  | 'neutral' 
  | 'unmatched';

interface StatusBadgeProps {
  status: StatusVariant | string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  showDot = true,
  className = '',
}) => {
  const normalized = (status || '').toLowerCase().replace(/[\s-]/g, '_');

  // Technical Brutalism + Minimalism Stamp Badges
  let styleClasses = 'bg-white text-slate-900 border-slate-900';

  if (['verified', 'completed', 'on_track', 'accepted'].includes(normalized)) {
    styleClasses = 'bg-emerald-100 text-emerald-950 border-emerald-900';
  } else if (['warning', 'review', 'review_required', 'pending_review', 'at_risk', 'action'].includes(normalized)) {
    styleClasses = 'bg-amber-200 text-amber-950 border-amber-900';
  } else if (['critical', 'delayed', 'failed', 'rejected', 'high'].includes(normalized)) {
    styleClasses = 'bg-rose-100 text-rose-950 border-rose-900';
  } else if (['info', 'active', 'auto_linked', 'in_progress'].includes(normalized)) {
    styleClasses = 'bg-blue-100 text-blue-950 border-blue-900';
  } else if (['unmatched', 'neutral', 'archived'].includes(normalized)) {
    styleClasses = 'bg-stone-100 text-slate-800 border-slate-600';
  }

  // Format label: clean technical uppercase without brackets
  const rawLabel = label || status.replace(/_/g, ' ');
  const displayLabel = rawLabel.replace(/^\[|\]$/g, '').toUpperCase();

  const sizeClass = size === 'sm' 
    ? 'px-1.5 py-0.5 text-[10px]' 
    : size === 'lg'
    ? 'px-2.5 py-1 text-xs'
    : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider border rounded-none shadow-[1px_1px_0px_0px_#0f172a] select-none ${sizeClass} ${styleClasses} ${className}`}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 bg-current shrink-0" />
      )}
      <span className="truncate">{displayLabel}</span>
    </span>
  );
};

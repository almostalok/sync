import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`rounded-none border-[1.5px] border-slate-900 bg-white p-10 text-center flex flex-col items-center justify-center space-y-3 font-mono shadow-[2px_2px_0px_#0f172a] ${className}`}
    >
      <div className="p-3 border border-slate-900 bg-stone-100 text-slate-900">
        {icon || <Inbox className="w-6 h-6" />}
      </div>
      <div className="space-y-1 max-w-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          [{title.replace(/^\[|\]$/g, '')}]
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed font-sans">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

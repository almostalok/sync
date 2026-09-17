import React from 'react';

export interface TimelineItem {
  id: string;
  timestamp: string;
  title: string;
  description?: string;
  actor?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ items, className = '' }) => {
  return (
    <div className={`space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-[2px] before:bg-slate-900 ${className}`}>
      {items.map((item, idx) => (
        <div key={item.id || idx} className="relative flex items-start gap-4 pl-8">
          {/* Square Node Stamp */}
          <div className="absolute left-1.5 top-2 w-3.5 h-3.5 rounded-none border border-slate-900 bg-black shadow-[1px_1px_0px_#000]" />

          {/* Content Block */}
          <div className="flex-1 bg-white border-[1.5px] border-slate-900 rounded-none p-3 text-xs font-mono shadow-[2px_2px_0px_#0f172a] space-y-1">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 uppercase">[{item.title}]</span>
                {item.badge}
              </div>
              <span className="text-[10px] text-slate-600 font-mono font-bold bg-stone-100 px-1 border border-slate-300">{item.timestamp}</span>
            </div>
            {item.description && (
              <p className="text-slate-800 leading-relaxed pt-1">{item.description}</p>
            )}
            {item.actor && (
              <div className="text-[10px] text-slate-600 pt-1 border-t border-dashed border-slate-200">
                ACTOR: <span className="font-bold text-slate-950 font-mono">{item.actor}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { Search, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterDropdown {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (val: string) => void;
}

interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  searchPlaceholder?: string;
  dropdowns?: FilterDropdown[];
  onReset?: () => void;
  extraActions?: React.ReactNode;
  resultCount?: number;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  dropdowns = [],
  onReset,
  extraActions,
  resultCount,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border-[1.5px] border-slate-900 rounded-none p-3 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#0f172a] font-mono text-xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search Input */}
        {onSearchChange && (
          <div className="relative min-w-[220px] flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-white text-slate-900 placeholder-slate-400 text-xs font-mono uppercase focus:outline-none focus:bg-amber-50/40"
            />
          </div>
        )}

        {/* Dropdowns */}
        {dropdowns.map((dd) => (
          <div key={dd.id} className="flex items-center gap-1.5">
            <label htmlFor={dd.id} className="text-slate-600 font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
              {dd.label.replace(/^\[|\]$/g, '')}:
            </label>
            <select
              id={dd.id}
              value={dd.value}
              onChange={(e) => dd.onChange(e.target.value)}
              className="rounded-none border-[1.5px] border-slate-900 bg-white py-1.5 px-2 text-xs font-mono text-slate-900 font-medium focus:outline-none focus:bg-amber-50/40"
            >
              {dd.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Reset Button */}
        {onReset && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-slate-900 bg-stone-100 hover:bg-stone-200 border border-slate-900 rounded-none transition active:translate-x-[1px] active:translate-y-[1px] font-bold uppercase text-[10px]"
          >
            <X className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {resultCount !== undefined && (
          <span className="text-[10px] text-slate-900 font-mono font-bold bg-stone-100 border border-slate-400 px-2 py-1">
            {resultCount} {resultCount === 1 ? 'RECORD' : 'RECORDS'}
          </span>
        )}
        {extraActions}
      </div>
    </div>
  );
};

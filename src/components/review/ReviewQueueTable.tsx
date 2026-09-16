'use client';

import React, { useState } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  Clock,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Search,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { ReviewItemModel } from '@sitesync/api/modules/review/review.types';
import { Discipline } from '@sitesync/types';

interface ReviewQueueTableProps {
  items: ReviewItemModel[];
  onSelectReview: (item: ReviewItemModel) => void;
  selectedReviewId?: string;
  onFilterDiscipline?: (discipline?: Discipline) => void;
  onSortChange?: (sort: string) => void;
}

export const ReviewQueueTable: React.FC<ReviewQueueTableProps> = ({
  items,
  onSelectReview,
  selectedReviewId,
  onFilterDiscipline,
  onSortChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<Discipline | undefined>(undefined);

  const filteredItems = items.filter((item) => {
    if (selectedDiscipline && item.recommendedMatch.discipline !== selectedDiscipline) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.event.description.toLowerCase().includes(q) ||
        item.recommendedMatch.activityCode.toLowerCase().includes(q) ||
        item.recommendedMatch.activityName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl text-slate-100 flex flex-col">
      {/* Top Filter Bar */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-sm text-white">Review Queue ({filteredItems.length} pending)</h3>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event or activity..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-48"
            />
          </div>

          {/* Discipline Filter */}
          <select
            value={selectedDiscipline || ''}
            onChange={(e) => {
              const disc = e.target.value ? (e.target.value as Discipline) : undefined;
              setSelectedDiscipline(disc);
              if (onFilterDiscipline) onFilterDiscipline(disc);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Disciplines</option>
            <option value={Discipline.CIVIL}>Civil</option>
            <option value={Discipline.PIPING}>Piping</option>
            <option value={Discipline.MECHANICAL}>Mechanical</option>
            <option value={Discipline.ELECTRICAL}>Electrical</option>
            <option value={Discipline.INSTRUMENTATION}>Instrumentation</option>
            <option value={Discipline.HSE}>HSE</option>
          </select>

          {/* Sort Option */}
          <select
            onChange={(e) => onSortChange && onSortChange(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="PRIORITY_DESC">Sort: Priority (Highest)</option>
            <option value="CONFIDENCE_ASC">Sort: Confidence (Lowest)</option>
            <option value="AMBIGUITY_DESC">Sort: Ambiguity (Highest)</option>
            <option value="DATE_DESC">Sort: Date (Newest)</option>
            <option value="DOWNSTREAM_IMPACT_DESC">Sort: Downstream Impact</option>
          </select>
        </div>
      </div>

      {/* Queue List Table */}
      <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[520px]">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No review items match the current filters.
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedReviewId === item.id;
            const prio = item.reviewPriority.score;
            return (
              <div
                key={item.id}
                onClick={() => onSelectReview(item)}
                className={`p-4 flex items-center justify-between gap-4 cursor-pointer transition-all hover:bg-slate-800/50 ${
                  isSelected ? 'bg-indigo-500/10 border-l-4 border-l-indigo-500' : 'bg-transparent'
                }`}
              >
                {/* Left: Priority & Confidence */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center font-bold text-xs border ${
                      prio >= 80
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : prio >= 60
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                    }`}
                  >
                    <span className="text-[10px] text-slate-400 leading-none">PRIO</span>
                    <span>{prio}</span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white">{item.event.description}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">
                        {item.event.discipline || 'GENERAL'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-slate-500">AI Proposed:</span>
                      <span className="font-mono text-indigo-300">{item.recommendedMatch.activityCode}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300">{item.recommendedMatch.activityName}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-slate-600" />
                        {item.evidence.sourceLocator || 'Report'}
                      </span>
                      <span>•</span>
                      <span>Score: {Math.round(item.recommendedMatch.finalScore * 100)}%</span>
                      <span>•</span>
                      <span className="text-amber-400/90">{item.reviewPriority.reasons[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Confidence Badge & Chevron */}
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-semibold text-sky-400">
                      {Math.round(item.recommendedMatch.confidence * 100)}% Conf
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {item.event.eventDate ? item.event.eventDate.split('T')[0] : '2026-03-12'}
                    </div>
                  </div>

                  <button className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

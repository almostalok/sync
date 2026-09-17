'use client';

import React, { useState } from 'react';
import { Discipline, ProductivityIntelligenceDTO } from '@sitesync/types';
import { 
  Zap, 
  Building2, 
  Info
} from 'lucide-react';

interface Props {
  data: ProductivityIntelligenceDTO[];
  loading: boolean;
}

export const ProductivityIntelligenceWidget: React.FC<Props> = ({ data, loading }) => {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');

  const filtered = data.filter(
    (p) => selectedDiscipline === 'ALL' || p.discipline.toUpperCase() === selectedDiscipline.toUpperCase()
  );

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Verifiable Productivity Rates & Benchmarks
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily execution velocity derived strictly from actual installed quantities divided by verified work duration.
          </p>
        </div>

        {/* Discipline Filter */}
        <select
          value={selectedDiscipline}
          onChange={(e) => setSelectedDiscipline(e.target.value)}
          className="px-2.5 py-1.5 rounded border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:border-slate-500"
        >
          <option value="ALL">All Disciplines</option>
          <option value="CIVIL">Civil</option>
          <option value="MECHANICAL">Mechanical</option>
          <option value="PIPING">Piping</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="INSTRUMENTATION">Instrumentation</option>
        </select>
      </div>

      {/* Grid of Productivity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-slate-50 rounded animate-pulse border border-slate-200" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-8 text-slate-500 text-xs">
            No productivity benchmarks found for selected discipline.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={`${item.activityType}_${item.unit}`}
              className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-white text-slate-700 border border-slate-200">
                    {item.discipline}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-medium">
                    {item.sampleCount} verified samples
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.activityType.replace(/_/g, ' ')}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    Standard Unit: <strong className="text-slate-800 font-mono">{item.unit}</strong>
                  </div>
                </div>

                {/* Percentile Stats */}
                <div className="grid grid-cols-3 gap-1.5 p-2 rounded bg-white border border-slate-200 text-center text-xs">
                  <div>
                    <div className="text-[9px] text-slate-500">P25</div>
                    <div className="font-mono font-semibold text-slate-700">
                      {item.p25}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-900 font-bold">Median</div>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {item.median}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-500">P75</div>
                    <div className="font-mono font-semibold text-slate-700">
                      {item.p75}
                    </div>
                  </div>
                </div>
              </div>

              {/* Benchmark Reference */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span className="truncate max-w-[140px]">{item.topProject}</span>
                </span>
                <span className="text-slate-800 font-mono font-semibold">
                  Med: {item.median} {item.unit}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 rounded bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-500 text-xs italic">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          Institutional Rule: Productivity metrics are calculated only for activities with verified volumetric or linear progress (m³, MT, joints, meters) and verified duration &gt; 0.
        </span>
      </div>
    </div>
  );
};

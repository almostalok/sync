'use client';

import React from 'react';
import { ProjectComparisonDTO } from '@sitesync/types';
import { 
  Building2, 
  MapPin
} from 'lucide-react';

interface Props {
  data: ProjectComparisonDTO | null;
  loading: boolean;
}

export const ProjectComparisonWidget: React.FC<Props> = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-48 bg-slate-50 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Cross-Project Historical Performance Matrix
          </h3>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Comparative execution benchmarks across completed Oil India capital infrastructure facilities.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-2.5 px-3">Project Code & Facility</th>
              <th className="py-2.5 px-3">Location</th>
              <th className="py-2.5 px-3 text-center">Completed Tasks</th>
              <th className="py-2.5 px-3 text-center">Avg Duration</th>
              <th className="py-2.5 px-3 text-center">Median Variance</th>
              <th className="py-2.5 px-3 text-center">Delay Rate</th>
              <th className="py-2.5 px-3">Dominant Delay Cause</th>
              <th className="py-2.5 px-3">Discipline Mix</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.projects.map((proj) => (
              <tr key={proj.projectId} className="hover:bg-slate-50 transition-colors">
                <td className="py-2.5 px-3">
                  <div className="font-bold text-slate-900">{proj.projectName}</div>
                  <div className="text-[10px] font-mono text-slate-500">{proj.projectCode}</div>
                </td>

                <td className="py-2.5 px-3 text-slate-700">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{proj.location}</span>
                  </div>
                </td>

                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                  {proj.completedActivities}
                </td>

                <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                  {proj.averageDurationDays}d
                </td>

                <td className="py-2.5 px-3 text-center font-mono font-bold">
                  <span
                    className={
                      proj.medianVarianceDays > 0
                        ? 'text-rose-700'
                        : proj.medianVarianceDays < 0
                        ? 'text-emerald-700'
                        : 'text-slate-600'
                    }
                  >
                    {proj.medianVarianceDays > 0 ? `+${proj.medianVarianceDays}` : proj.medianVarianceDays}d
                  </span>
                </td>

                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full ${
                          proj.delayRatePercentage > 30 ? 'bg-rose-600' : 'bg-amber-600'
                        }`}
                        style={{ width: `${proj.delayRatePercentage}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-slate-700 font-semibold">
                      {proj.delayRatePercentage}%
                    </span>
                  </div>
                </td>

                <td className="py-2.5 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                    {proj.topDelayCause}
                  </span>
                </td>

                <td className="py-2.5 px-3">
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(proj.disciplineMix).map(([disc, count]) => (
                      <span
                        key={disc}
                        className="px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-[9px] text-slate-600 font-mono"
                      >
                        {disc[0]}:{count}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

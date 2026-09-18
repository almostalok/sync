'use client';

import React from 'react';
import { ProgressTimeSeriesDTO } from '@sitesync/types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Info } from 'lucide-react';

interface ProgressScurveChartProps {
  timeSeries: ProgressTimeSeriesDTO;
}

export const ProgressScurveChart: React.FC<ProgressScurveChartProps> = ({ timeSeries }) => {
  const chartData = timeSeries.series.map((item) => {
    const d = new Date(item.date);
    const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    const isPastOrCurrent = new Date(item.date).getTime() <= new Date(timeSeries.currentDate).getTime();

    return {
      date: item.date,
      displayDate: label,
      plannedProgress: Math.round(item.plannedProgress * 1000) / 10,
      actualProgress: isPastOrCurrent ? Math.round(item.actualProgress * 1000) / 10 : null,
      variance: Math.round(item.variance * 1000) / 10,
    };
  });

  const latestPoint = chartData.find((p) => p.date === timeSeries.currentDate) || chartData[chartData.length - 1];

  return (
    <div className="rounded-none bg-white border-[1.5px] border-slate-900 p-4 space-y-3 shadow-[2px_2px_0px_#0f172a] font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-[1.5px] border-slate-900 pb-2.5">
        <div>
          <h2 className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
            {'// PROGRESS_S_CURVE: PLANNED_BASELINE VS VERIFIED_ACTUAL'}
          </h2>
          <p className="text-[10px] text-slate-600 font-mono">
            Duration-weighted cumulative progression baseline across project lifecycle
          </p>
        </div>

        {latestPoint && (
          <div className="flex items-center gap-2.5 bg-stone-100 px-2.5 py-1 border border-slate-900 text-xs font-mono">
            <div>
              <span className="text-slate-600 uppercase text-[9px] font-bold">ACTUAL: </span>
              <strong className="text-slate-950 font-mono font-bold">{latestPoint.actualProgress}%</strong>
            </div>
            <div className="border-l border-slate-400 pl-2.5">
              <span className="text-slate-600 uppercase text-[9px] font-bold">PLAN: </span>
              <strong className="text-slate-950 font-mono font-bold">{latestPoint.plannedProgress}%</strong>
            </div>
            <div className="border-l border-slate-400 pl-2.5">
              <span className="text-slate-600 uppercase text-[9px] font-bold">VAR: </span>
              <strong className={`font-mono font-bold ${latestPoint.variance < 0 ? 'text-red-700' : 'text-emerald-800'}`}>
                {latestPoint.variance > 0 ? '+' : ''}{latestPoint.variance}%
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Enterprise S-Curve Visualizer */}
      <div className="h-64 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 2" stroke="#cbd5e1" vertical={false} />
            <XAxis
              dataKey="displayDate"
              stroke="#0f172a"
              fontSize={10}
              tickLine={true}
              axisLine={{ stroke: '#0f172a', strokeWidth: 1.5 }}
              fontFamily="monospace"
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="#0f172a"
              fontSize={10}
              tickLine={true}
              axisLine={{ stroke: '#0f172a', strokeWidth: 1.5 }}
              fontFamily="monospace"
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border-[1.5px] border-slate-900 rounded-none shadow-[2px_2px_0px_#0f172a] p-2 text-xs font-mono space-y-1 z-50">
                      <div className="font-bold text-slate-950 border-b border-slate-900 pb-0.5 uppercase">[{data.date}]</div>
                      <div className="text-slate-700 flex justify-between gap-4">
                        <span>PLANNED:</span>
                        <strong className="text-slate-950 font-mono">{data.plannedProgress}%</strong>
                      </div>
                      {data.actualProgress !== null && (
                        <div className="text-slate-950 flex justify-between gap-4 font-bold">
                          <span>VERIFIED:</span>
                          <strong className="font-mono">{data.actualProgress}%</strong>
                        </div>
                      )}
                      <div className="text-slate-700 flex justify-between gap-4 border-t border-slate-300 pt-0.5">
                        <span>VARIANCE:</span>
                        <strong className={`font-mono ${data.variance < 0 ? 'text-red-700' : 'text-emerald-800'}`}>
                          {data.variance > 0 ? '+' : ''}{data.variance}%
                        </strong>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '10px', fontFamily: 'monospace' }}
            />
            {/* Planned Baseline: Slate Dashed Line */}
            <Line
              name="[PLANNED_BASELINE]"
              type="stepAfter"
              dataKey="plannedProgress"
              stroke="#64748b"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
              activeDot={{ r: 3, stroke: '#0f172a', strokeWidth: 1 }}
            />
            {/* Verified Actual Progress: High-contrast Solid Line */}
            <Line
              name="[VERIFIED_ACTUAL]"
              type="linear"
              dataKey="actualProgress"
              stroke="#0f172a"
              strokeWidth={2}
              dot={{ r: 2.5, fill: '#0f172a', stroke: '#ffffff', strokeWidth: 1 }}
              activeDot={{ r: 4, fill: '#0f172a' }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

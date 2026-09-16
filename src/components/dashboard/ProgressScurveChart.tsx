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
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-white tracking-tight">
              Progress S-Curve: Planned vs Actual
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Duration-weighted cumulative progression baseline across project lifecycle
          </p>
        </div>

        {latestPoint && (
          <div className="flex items-center gap-4 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Actual: </span>
              <strong className="text-emerald-400 font-mono font-bold">{latestPoint.actualProgress}%</strong>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-slate-400">Plan: </span>
              <strong className="text-cyan-400 font-mono font-bold">{latestPoint.plannedProgress}%</strong>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <span className="text-slate-400">Variance: </span>
              <strong className={`font-mono font-bold ${latestPoint.variance < 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {latestPoint.variance > 0 ? '+' : ''}{latestPoint.variance}%
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Recharts S-Curve Visualizer */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              dataKey="displayDate"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#475569' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl bg-slate-950/95 border border-slate-700 p-3 shadow-2xl text-xs space-y-1.5 font-sans">
                      <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                        {data.date} ({label})
                      </div>
                      <div className="flex items-center justify-between gap-4 text-cyan-300">
                        <span>Planned Progress:</span>
                        <strong className="font-mono">{data.plannedProgress}%</strong>
                      </div>
                      {data.actualProgress !== null ? (
                        <>
                          <div className="flex items-center justify-between gap-4 text-emerald-400">
                            <span>Actual Progress:</span>
                            <strong className="font-mono">{data.actualProgress}%</strong>
                          </div>
                          <div className="flex items-center justify-between gap-4 text-amber-300 border-t border-slate-800/80 pt-1">
                            <span>Schedule Delta:</span>
                            <strong className="font-mono font-bold">
                              {data.variance > 0 ? '+' : ''}{data.variance}%
                            </strong>
                          </div>
                        </>
                      ) : (
                        <div className="text-slate-500 italic pt-1 text-[11px]">
                          Future scheduled projection
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
            />
            <ReferenceLine
              x={chartData.find((p) => p.date === timeSeries.currentDate)?.displayDate || '16 Sep'}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: 'As of Today (16 Sep)',
                fill: '#f59e0b',
                fontSize: 10,
                position: 'insideTopLeft',
              }}
            />
            <Line
              type="monotone"
              dataKey="plannedProgress"
              name="Planned Target Baseline"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#06b6d4' }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="actualProgress"
              name="Verified Actual Execution"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981' }}
              activeDot={{ r: 7 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Accessible Text Summary for Screen Readers & Clarity */}
      <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Execution Velocity Summary: </span>
          <span>
            Project execution is currently at <strong className="text-emerald-400">68.0%</strong> against the planned target of <strong className="text-cyan-300">72.0%</strong> (deficit of -4.0%). Electrical discipline exhibits the largest single progress deficit (-8.0%), followed by Instrumentation (-5.0%).
          </span>
        </div>
      </div>
    </div>
  );
};

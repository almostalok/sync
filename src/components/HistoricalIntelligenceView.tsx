'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  HistoricalOverviewDTO, 
  HistoricalBenchmarkDTO, 
  DelayIntelligenceDTO, 
  ProductivityIntelligenceDTO, 
  ProjectComparisonDTO, 
  HistoricalOutcomeDTO 
} from '@sitesync/types';
import { HistoricalOverviewWidget } from './history/HistoricalOverviewWidget';
import { ActivityBenchmarkTable } from './history/ActivityBenchmarkTable';
import { DurationDistributionWidget } from './history/DurationDistributionWidget';
import { DelayIntelligenceWidget } from './history/DelayIntelligenceWidget';
import { ProductivityIntelligenceWidget } from './history/ProductivityIntelligenceWidget';
import { ProjectComparisonWidget } from './history/ProjectComparisonWidget';
import { HistoricalSearchWidget } from './history/HistoricalSearchWidget';
import { HistoricalRecordDetailDrawer } from './history/HistoricalRecordDetailDrawer';
import { SimilarActivityDrawer } from './history/SimilarActivityDrawer';
import { ProjectClosureModal } from './history/ProjectClosureModal';
import { 
  BarChart2, 
  AlertTriangle, 
  Zap, 
  Building2, 
  Search, 
  Database, 
  Sparkles, 
  Compass,
  ArrowRight
} from 'lucide-react';

export const HistoricalIntelligenceView: React.FC = () => {
  const { setActiveView } = useProject();

  // Tab State
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'delays' | 'productivity' | 'projects' | 'search'>('benchmarks');

  // Data States
  const [overview, setOverview] = useState<HistoricalOverviewDTO | null>(null);
  const [benchmarks, setBenchmarks] = useState<HistoricalBenchmarkDTO[]>([]);
  const [delays, setDelays] = useState<{ summary: any; categories: DelayIntelligenceDTO[] } | null>(null);
  const [productivity, setProductivity] = useState<ProductivityIntelligenceDTO[]>([]);
  const [projects, setProjects] = useState<ProjectComparisonDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected State for Drawers / Modals
  const [selectedBenchmark, setSelectedBenchmark] = useState<HistoricalBenchmarkDTO | null>(null);
  const [similarBenchmark, setSimilarBenchmark] = useState<HistoricalBenchmarkDTO | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<HistoricalOutcomeDTO | null>(null);
  const [showClosureModal, setShowClosureModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ovRes, benchRes, delayRes, prodRes, projRes] = await Promise.all([
          fetch('/api/v1/history/overview'),
          fetch('/api/v1/history/benchmarks'),
          fetch('/api/v1/history/delays'),
          fetch('/api/v1/history/productivity'),
          fetch('/api/v1/history/projects'),
        ]);

        const [ovJson, benchJson, delayJson, prodJson, projJson] = await Promise.all([
          ovRes.json(),
          benchRes.json(),
          delayRes.json(),
          prodRes.json(),
          projRes.json(),
        ]);

        if (ovJson.success) setOverview(ovJson.data);
        if (benchJson.success) setBenchmarks(benchJson.data);
        if (delayJson.success) setDelays(delayJson.data);
        if (prodJson.success) setProductivity(prodJson.data);
        if (projJson.success) setProjects(projJson.data);
      } catch (err) {
        console.error('Failed to load historical intelligence data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInspectOutcomeById = async (outcomeId: string) => {
    try {
      const res = await fetch(`/api/v1/history/${outcomeId}`);
      const json = await res.json();
      if (json.success) {
        setSelectedRecord(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch outcome by ID:', err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Header */}
      <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-purple-500/20 bg-gradient-to-r from-purple-950/30 via-slate-900/60 to-cyan-950/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Database className="w-3 h-3" />
              <span>Historical Intelligence & Institutional Memory</span>
            </span>
            <span className="text-xs text-slate-400">Oil India Limited Asset Repository</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-100">
            Past Project Reality, Duration Benchmarks & Delay Root-Causes
          </h2>
          <p className="text-xs text-slate-400">
            Query empirical execution data across completed capital projects to eliminate optimism bias in scheduling.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowClosureModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>Project Closure Gate</span>
          </button>

          <button
            onClick={() => setActiveView('copilot')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/30 transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Historical Copilot</span>
          </button>
        </div>
      </div>

      {/* High-level Historical Overview KPIs */}
      <HistoricalOverviewWidget overview={overview} loading={loading} />

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('benchmarks')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'benchmarks'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/80 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Activity Benchmarks & Distributions</span>
        </button>

        <button
          onClick={() => setActiveTab('delays')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'delays'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/80 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Delay Intelligence & Causes</span>
        </button>

        <button
          onClick={() => setActiveTab('productivity')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'productivity'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/80 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>Productivity Rates</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'projects'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/80 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Building2 className="w-4 h-4 text-slate-400" />
          <span>Cross-Project Comparisons</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`px-4 py-2.5 rounded-t-xl transition flex items-center gap-2 border-b-2 ${
            activeTab === 'search'
              ? 'border-cyan-400 text-cyan-300 bg-slate-900/80 font-bold'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Search className="w-4 h-4 text-purple-400" />
          <span>Search & Lineage Records</span>
        </button>
      </div>

      {/* Tab Content Views */}
      <div className="space-y-6">
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            {/* If benchmark is selected, show distribution visualizer on top */}
            {selectedBenchmark && (
              <DurationDistributionWidget
                benchmark={selectedBenchmark}
                onClose={() => setSelectedBenchmark(null)}
                onSelectRecord={(rec) => setSelectedRecord(rec)}
              />
            )}

            <ActivityBenchmarkTable
              benchmarks={benchmarks}
              loading={loading}
              onSelectBenchmark={(b) => setSelectedBenchmark(b)}
              onOpenSimilar={(b) => setSimilarBenchmark(b)}
            />
          </div>
        )}

        {activeTab === 'delays' && (
          <DelayIntelligenceWidget data={delays} loading={loading} />
        )}

        {activeTab === 'productivity' && (
          <ProductivityIntelligenceWidget data={productivity} loading={loading} />
        )}

        {activeTab === 'projects' && (
          <ProjectComparisonWidget data={projects} loading={loading} />
        )}

        {activeTab === 'search' && (
          <HistoricalSearchWidget
            onSelectRecord={(rec) => setSelectedRecord(rec)}
          />
        )}
      </div>

      {/* Drawers & Modals */}
      <HistoricalRecordDetailDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />

      <SimilarActivityDrawer
        benchmark={similarBenchmark}
        onClose={() => setSimilarBenchmark(null)}
        onSelectRecord={(id) => handleInspectOutcomeById(id)}
      />

      <ProjectClosureModal
        isOpen={showClosureModal}
        onClose={() => setShowClosureModal(false)}
        onProjectClosed={async () => {
          const res = await fetch('/api/v1/history/overview');
          const json = await res.json();
          if (json.success) setOverview(json.data);
        }}
      />
    </div>
  );
};

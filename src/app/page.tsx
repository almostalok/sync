'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { CommandCenterView } from '@/components/CommandCenterView';
import { GanttView } from '@/components/GanttView';
import { ReviewQueueView } from '@/components/ReviewQueueView';
import { ReportsView } from '@/components/ReportsView';
import { EvidenceView } from '@/components/EvidenceView';
import { RiskRadarView } from '@/components/RiskRadarView';
import { HistoricalIntelligenceView } from '@/components/HistoricalIntelligenceView';
import { CopilotView } from '@/components/CopilotView';
import { VoiceReporterView } from '@/components/VoiceReporterView';
import { BenchmarkView } from '@/components/BenchmarkView';
import { AuditLogView } from '@/components/AuditLogView';
import { DemoScriptModal } from '@/components/DemoScriptModal';

export default function Home() {
  const { state } = useProject();
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#070b13] text-slate-100">
      {/* Top Application Header */}
      <Header onOpenDemoModal={() => setShowDemoModal(true)} />

      {/* Main Workspace Layout with Sidebar and Active View Content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {state.activeView === 'dashboard' && <CommandCenterView onOpenDemoModal={() => setShowDemoModal(true)} />}
          {state.activeView === 'gantt' && <GanttView />}
          {state.activeView === 'review' && <ReviewQueueView />}
          {state.activeView === 'reports' && <ReportsView />}
          {state.activeView === 'evidence' && <EvidenceView />}
          {state.activeView === 'risks' && <RiskRadarView />}
          {state.activeView === 'history' && <HistoricalIntelligenceView />}
          {state.activeView === 'copilot' && <CopilotView />}
          {state.activeView === 'voice' && <VoiceReporterView />}
          {state.activeView === 'benchmark' && <BenchmarkView />}
          {state.activeView === 'audit' && <AuditLogView />}
        </main>
      </div>

      {/* Interactive SIH Demo Script Walkthrough Modal */}
      <DemoScriptModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </div>
  );
}

'use client';

import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { ProjectState } from '@/lib/store/projectStore';
import { 
  LayoutDashboard, 
  CalendarRange, 
  GitFork, 
  FileText, 
  CheckSquare, 
  SearchCheck, 
  AlertOctagon, 
  Sparkles, 
  Mic, 
  BarChart2, 
  BookOpen, 
  History 
} from 'lucide-react';

interface NavItem {
  id: ProjectState['activeView'];
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { state, setActiveView } = useProject();

  const pendingReviewCount = state.events.filter(
    e => e.match?.decision === 'PENDING_REVIEW' || (e.match?.confidence && e.match.confidence >= 0.70 && e.match.confidence < 0.90 && e.match.decision !== 'ACCEPTED')
  ).length;

  const highRiskCount = state.risks.filter(r => r.severity === 'HIGH').length;

  const navGroups: { group: string; items: NavItem[] }[] = [
    {
      group: 'OVERVIEW & SCHEDULE',
      items: [
        { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
        { id: 'gantt', label: 'Schedule & Gantt', icon: CalendarRange },
        { id: 'history', label: 'Historical Memory', icon: BookOpen },
      ]
    },
    {
      group: 'FIELD INTELLIGENCE',
      items: [
        { id: 'reports', label: 'DPR & Field Reports', icon: FileText, badge: state.fieldReports.length, badgeColor: 'bg-slate-700 text-slate-300' },
        { 
          id: 'review', 
          label: 'Review Queue', 
          icon: CheckSquare, 
          badge: pendingReviewCount > 0 ? pendingReviewCount : undefined, 
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
        },
        { id: 'evidence', label: 'Evidence Provenance', icon: SearchCheck },
      ]
    },
    {
      group: 'INTELLIGENCE & AI',
      items: [
        { 
          id: 'risks', 
          label: 'Risk & Dependencies', 
          icon: AlertOctagon, 
          badge: highRiskCount > 0 ? `${highRiskCount} High` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
        },
        { id: 'copilot', label: 'Grounded Copilot', icon: Sparkles, badge: 'AI', badgeColor: 'bg-purple-900/60 text-purple-300' },
        { id: 'voice', label: 'Voice Field Memo', icon: Mic, badge: 'Live', badgeColor: 'bg-emerald-900/60 text-emerald-300' },
        { id: 'benchmark', label: 'Benchmark & Baselines', icon: BarChart2 },
      ]
    },
    {
      group: 'GOVERNANCE',
      items: [
        { id: 'audit', label: 'Audit Trail', icon: History },
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-800/80 bg-[#0a0f1d]/70 backdrop-blur-lg min-h-[calc(100vh-61px)] p-3">
      <div className="space-y-5 flex-1">
        {navGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h2 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-300/80">
              {grp.group}
            </h2>
            <div className="space-y-0.5">
              {grp.items.map(item => {
                const Icon = item.icon;
                const isActive = state.activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-cyan-950/80 to-blue-950/50 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/50'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-md ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Safety Principle Sticky Note in Sidebar */}
      <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-1.5">
        <div className="flex items-center gap-1.5 font-semibold text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Core Safety Policy</span>
        </div>
        <p className="text-slate-400 text-[10px] leading-relaxed">
          SiteSync never silently forces schedule updates. Matches below 90% confidence require planner verification.
        </p>
        <div className="flex items-center justify-between text-[9px] pt-1 text-slate-400 border-t border-slate-800">
          <span>Auto: ≥90%</span>
          <span>Review: 70-89%</span>
          <span>Unmatch: &lt;70%</span>
        </div>
      </div>
    </aside>
  );
};

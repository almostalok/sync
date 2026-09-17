'use client';

import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { ProjectState } from '@/lib/store/projectStore';
import { 
  LayoutDashboard, 
  CalendarRange, 
  FileText, 
  CheckSquare, 
  SearchCheck, 
  AlertOctagon, 
  TrendingUp, 
  BookOpen, 
  Compass, 
  Mic, 
  BarChart2, 
  History,
  ShieldCheck
} from 'lucide-react';

interface NavItem {
  id: ProjectState['activeView'];
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeVariant?: 'neutral' | 'warning' | 'critical' | 'info';
}

export const Sidebar: React.FC = () => {
  const { state, setActiveView } = useProject();

  const pendingReviewCount = state.events.filter(
    e => e.match?.decision === 'PENDING_REVIEW' || (e.match?.confidence && e.match.confidence >= 0.70 && e.match.confidence < 0.90 && e.match.decision !== 'ACCEPTED')
  ).length;

  const highRiskCount = state.risks.filter(r => r.severity === 'HIGH').length;

  const navGroups: { group: string; prefix: string; items: NavItem[] }[] = [
    {
      group: 'PROJECT_OPERATIONS',
      prefix: '01',
      items: [
        { id: 'dashboard', label: 'COMMAND_CENTER', icon: LayoutDashboard },
        { id: 'gantt', label: 'SCHEDULE_GANTT', icon: CalendarRange },
        { id: 'reports', label: 'FIELD_REPORTS_DPR', icon: FileText, badge: state.fieldReports.length, badgeVariant: 'neutral' },
        { 
          id: 'review', 
          label: 'REVIEW_QUEUE', 
          icon: CheckSquare, 
          badge: pendingReviewCount > 0 ? pendingReviewCount : undefined, 
          badgeVariant: 'warning' 
        },
        { id: 'evidence', label: 'EVIDENCE_PROVENANCE', icon: SearchCheck },
      ]
    },
    {
      group: 'INTELLIGENCE_CONTROLS',
      prefix: '02',
      items: [
        { 
          id: 'risks', 
          label: 'FLOAT_RADAR_RISKS', 
          icon: AlertOctagon, 
          badge: highRiskCount > 0 ? `${highRiskCount} HIGH` : undefined,
          badgeVariant: 'critical'
        },
        { id: 'forecast', label: 'SCENARIO_SIMULATOR', icon: TrendingUp },
        { id: 'history', label: 'HISTORICAL_BENCH', icon: BookOpen },
      ]
    },
    {
      group: 'ANALYTICAL_TOOLS',
      prefix: '03',
      items: [
        { id: 'copilot', label: 'SCHEDULE_DOSSIER', icon: Compass },
        { id: 'voice', label: 'VOICE_INGESTION', icon: Mic },
        { id: 'benchmark', label: 'MODEL_EVALUATION', icon: BarChart2 },
      ]
    },
    {
      group: 'COMPLIANCE_AUDIT',
      prefix: '04',
      items: [
        { id: 'audit', label: 'AUDIT_TRAIL', icon: History },
      ]
    }
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r-[2px] border-slate-900 bg-stone-50 min-h-[calc(100vh-53px)] p-3 font-mono">
      <div className="space-y-4 flex-1">
        {navGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <h2 className="px-2 text-[9px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5 border-b border-slate-300 pb-0.5">
              <span>{grp.prefix} //</span>
              <span>{grp.group}</span>
            </h2>
            <div className="space-y-1 pt-1">
              {grp.items.map(item => {
                const Icon = item.icon;
                const isActive = state.activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-none text-xs font-mono font-bold transition uppercase tracking-wider ${
                      isActive
                        ? 'bg-black text-white border-[1.5px] border-black shadow-[2px_2px_0px_#0f172a]'
                        : 'text-slate-800 hover:bg-stone-200 border border-transparent hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-700'}`} />
                      <span className="truncate text-[11px]">{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-none text-[9px] font-bold font-mono border ${
                          isActive
                            ? 'bg-white text-black border-white'
                            : item.badgeVariant === 'warning'
                            ? 'bg-amber-300 text-black border-slate-900'
                            : item.badgeVariant === 'critical'
                            ? 'bg-red-600 text-white border-slate-900'
                            : 'bg-stone-200 text-slate-800 border-slate-400'
                        }`}
                      >
                        [{item.badge}]
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Safety Compliance Footer Note */}
      <div className="mt-4 p-2.5 rounded-none border-[1.5px] border-slate-900 bg-white text-[10px] space-y-1 shadow-[2px_2px_0px_#0f172a]">
        <div className="flex items-center gap-1.5 font-bold text-slate-950 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-900" />
          <span>[SAFETY_RULE::CIV-09]</span>
        </div>
        <p className="text-[10px] text-slate-700 leading-tight">
          MATCH &lt; 90% MANDATES MANUAL VERIFICATION PRIOR TO P6 WRITE-BACK.
        </p>
      </div>
    </aside>
  );
};

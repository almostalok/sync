'use client';

import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  History, 
  ShieldCheck, 
  UserCheck, 
  Clock, 
  Cpu, 
  FileText, 
  AlertTriangle 
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { state } = useProject();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Immutable Governance Trail
            </span>
            <span className="text-xs text-slate-400">Rule 4 & FR-09 Compliance</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Audit Log of Every Schedule-Changing Action & Verification
          </h2>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          Total Audit Records: <strong className="text-cyan-400">{state.auditLogs.length}</strong>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Explanation & Verification Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {state.auditLogs.map(log => {
                return (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        {log.userId === 'SYSTEM' || log.userId === 'AUTO_LINK_ENGINE' ? (
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{log.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{log.userId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.action === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        log.action === 'AUTO_LINKED' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                        log.action === 'REJECTED' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        log.action === 'UNMATCHED' ? 'bg-slate-800 text-slate-400' :
                        'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-3 text-slate-300 leading-relaxed max-w-md">
                      {log.explanation}
                      {log.beforeState && log.afterState && (
                        <div className="mt-1 text-[10px] text-slate-500 font-mono">
                          Diff: Progress {log.beforeState.actualProgress}% → {log.afterState.actualProgress}%
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

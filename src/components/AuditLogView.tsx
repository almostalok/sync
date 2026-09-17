'use client';

import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  History, 
  ShieldCheck, 
  UserCheck, 
  Cpu
} from 'lucide-react';
import { StatusBadge } from '@sitesync/design-system';

export const AuditLogView: React.FC = () => {
  const { state } = useProject();

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200">
              Immutable Governance Trail
            </span>
            <span className="text-xs text-slate-500 font-mono">FR-09 Compliance & Audit Ledger</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Schedule Verification & Decision Audit Log
          </h1>
          <p className="text-xs text-slate-600">
            Cryptographic ledger tracking every human verification, auto-link action, and progress adjustment.
          </p>
        </div>

        <div className="text-xs text-slate-700 font-mono bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
          Audit Records: <strong className="text-slate-900">{state.auditLogs.length}</strong>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor / User</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Target Entity</th>
                <th className="py-2.5 px-3">Explanation & Verification Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {state.auditLogs.map((log) => {
                return (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], { 
                        month: 'short', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                        {log.userId === 'SYSTEM' || log.userId === 'AUTO_LINK_ENGINE' ? (
                          <Cpu className="w-3.5 h-3.5 text-slate-500" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        <span>{log.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{log.userId}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        log.action === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                        log.action === 'AUTO_LINKED' ? 'bg-slate-100 text-slate-800 border border-slate-200' :
                        log.action === 'REJECTED' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                        log.action === 'UNMATCHED' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                        'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-3 text-slate-700 leading-relaxed max-w-md">
                      {log.explanation}
                      {log.beforeState && log.afterState && (
                        <div className="mt-1 text-[10px] text-slate-500 font-mono bg-slate-50 p-1 rounded border border-slate-200">
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

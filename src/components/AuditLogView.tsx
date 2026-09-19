'use client';

import React from 'react';
import { useProject } from '@/context/ProjectContext';
import { 
  History, 
  ShieldCheck, 
  UserCheck, 
  Cpu
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { state } = useProject();

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-950 border-emerald-900';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-950 border-rose-900';
      case 'OVERRIDDEN':
        return 'bg-amber-100 text-amber-950 border-amber-900';
      case 'AUTO_LINKED':
        return 'bg-sky-100 text-sky-950 border-sky-900';
      default:
        return 'bg-stone-100 text-slate-950 border-slate-900';
    }
  };

  const getActionBorder = (action: string) => {
    switch (action) {
      case 'ACCEPTED':
        return 'border-l-4 border-l-emerald-600';
      case 'REJECTED':
        return 'border-l-4 border-l-rose-600';
      case 'OVERRIDDEN':
        return 'border-l-4 border-l-amber-500';
      case 'AUTO_LINKED':
        return 'border-l-4 border-l-sky-500';
      default:
        return 'border-l-4 border-l-slate-900';
    }
  };

  return (
    <div className="space-y-5 pb-12 font-mono">
      {/* Top Banner */}
      <div className="bg-white border-[1.5px] border-slate-900 border-t-4 border-t-amber-500 rounded-none p-4 shadow-[2px_2px_0px_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded-none text-[9px] font-bold tracking-wider uppercase bg-amber-100 text-amber-950 border border-amber-900">
              [04 // COMPLIANCE_AUDIT]
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-xs text-slate-600 font-mono">FR-09 COMPLIANCE & AUDIT LEDGER</span>
          </div>
          <h1 className="text-base md:text-lg font-black text-slate-950 tracking-tight uppercase">
            SCHEDULE VERIFICATION & DECISION AUDIT LOG
          </h1>
          <p className="text-xs text-slate-700 font-sans">
            Cryptographic ledger tracking every human verification, auto-link action, and baseline adjustment.
          </p>
        </div>

        <div className="text-xs text-slate-900 font-mono bg-stone-100 px-3 py-1.5 rounded-none border border-slate-900 shadow-[1px_1px_0px_#000]">
          AUDIT_RECORDS: <strong className="text-slate-950 font-black">{state.auditLogs.length}</strong>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border-[1.5px] border-slate-900 rounded-none shadow-[2px_2px_0px_#0f172a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead>
              <tr className="bg-stone-100 border-b border-slate-900 text-slate-950 font-black uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">TIMESTAMP</th>
                <th className="py-2.5 px-3">ACTOR / OPERATOR</th>
                <th className="py-2.5 px-3">ACTION</th>
                <th className="py-2.5 px-3">TARGET ENTITY</th>
                <th className="py-2.5 px-3">RATIONALE & DELTA DIFF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {state.auditLogs.map((log) => {
                return (
                  <tr key={log.id} className={`hover:bg-stone-50 transition ${getActionBorder(log.action)}`}>
                    <td className="py-3 px-3 font-mono text-slate-600 text-[10px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], { 
                        month: 'short', 
                        day: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit', 
                        second: '2-digit' 
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-950 flex items-center gap-1.5 uppercase">
                        {log.userId === 'SYSTEM' || log.userId === 'AUTO_LINK_ENGINE' ? (
                          <Cpu className="w-3.5 h-3.5 text-slate-700" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
                        )}
                        <span>{log.userName}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">[{log.userId}]</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-1.5 py-0.5 border text-[9px] font-black uppercase ${getActionBadge(log.action)}`}>
                        [{log.action}]
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-950">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-3 text-slate-800 leading-relaxed max-w-md">
                      <p className="font-sans text-xs">{log.explanation}</p>
                      {log.beforeState && log.afterState && (
                        <div className="mt-1 text-[10px] text-slate-800 font-mono bg-stone-100 p-1.5 border border-slate-400">
                          DELTA: PROGRESS {log.beforeState.actualProgress}% &rarr; <span className="font-black text-slate-950">{log.afterState.actualProgress}%</span>
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

'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { FieldReport, DisciplineType } from '@/types/domain';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Mic, 
  Search, 
  Plus, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { state, uploadReport, selectReport, selectEvent, setActiveView } = useProject();

  const [selectedReportId, setSelectedReportId] = useState<string>(
    state.selectedReportId || state.fieldReports[0]?.id || ''
  );
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileName, setFileName] = useState('');
  const [sourceType, setSourceType] = useState<FieldReport['sourceType']>('PDF');
  const [discipline, setDiscipline] = useState<DisciplineType>('CIVIL');
  const [rawText, setRawText] = useState('');
  const [uploadedBy, setUploadedBy] = useState('Rajesh Sharma (Civil Supervisor)');

  const currentReport = state.fieldReports.find(r => r.id === selectedReportId) || state.fieldReports[0];
  const reportEvents = state.events.filter(e => e.fieldReportId === currentReport?.id);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim()) return;

    const name = fileName.trim() || `DPR-UPLOAD-${Date.now().toString().slice(-4)}.${sourceType.toLowerCase()}`;
    uploadReport(name, sourceType, rawText, '2026-09-16', discipline, uploadedBy);
    setShowUploadModal(false);
    setRawText('');
    setFileName('');
  };

  const loadSampleDPR = () => {
    setFileName('DPR-2026-09-16-Acceptance.pdf');
    setSourceType('PDF');
    setDiscipline('CIVIL');
    setRawText(`DAILY PROGRESS REPORT — OIL COMPRESSOR STATION
Date: 16-Sep-2026 | Shift: Day | Location: Duliajan Gas Terminal

CIVIL SUMMARY:
Comp foundation excavation is approx 80% complete. North side completed today. PCC preparation expected tomorrow. Excavation depth verified against survey drawings. Heavy soil water seep managed via dewatering pump.`);
    setUploadedBy('Rajesh Sharma (Civil Supervisor)');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Field Intelligence Ingestion
            </span>
            <span className="text-xs text-slate-400">{state.fieldReports.length} Reports Ingested</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Unstructured DPRs, Spreadsheets & Field Logs
          </h2>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Field Report</span>
        </button>
      </div>

      {/* Grid Layout: Left List vs Right Document View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 cols: Reports List */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-4 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block border-b border-slate-800 pb-2">
            Uploaded Field Documents
          </span>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {state.fieldReports.map(rep => {
              const isSelected = rep.id === currentReport?.id;
              const evCount = state.events.filter(e => e.fieldReportId === rep.id).length;

              return (
                <div
                  key={rep.id}
                  onClick={() => {
                    setSelectedReportId(rep.id);
                    selectReport(rep.id);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition border space-y-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-950'
                      : 'bg-slate-900/50 hover:bg-slate-800/50 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      {rep.sourceType === 'PDF' && <FileText className="w-4 h-4 text-rose-400 shrink-0" />}
                      {rep.sourceType === 'XLSX' && <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {rep.sourceType === 'TXT' && <FileText className="w-4 h-4 text-cyan-400 shrink-0" />}
                      {rep.sourceType === 'AUDIO' && <Mic className="w-4 h-4 text-purple-400 shrink-0" />}
                      <span className="text-xs font-bold text-slate-200 truncate">{rep.fileName}</span>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 shrink-0">
                      PROCESSED
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Date: {rep.reportDate}</span>
                    <span className="text-cyan-400 font-semibold">{evCount} Events Extracted</span>
                  </div>

                  <div className="text-[10px] text-slate-500 truncate">
                    Uploaded by: {rep.uploadedBy}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 cols: Document Viewer & Extracted Events Breakdown */}
        {currentReport && (
          <div className="lg:col-span-8 glass-card rounded-2xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">Document Inspector</span>
                <h3 className="text-base font-bold text-white">{currentReport.fileName}</h3>
                <span className="text-xs text-slate-400">Submitted by {currentReport.uploadedBy} • {currentReport.reportDate}</span>
              </div>

              <button
                onClick={() => setActiveView('review')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold self-start sm:self-auto"
              >
                <span>Go to Review Queue →</span>
              </button>
            </div>

            {/* Raw Text Box */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Raw Field Report Content</span>
              <div className="p-4 rounded-xl bg-[#080d18] border border-slate-800 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {currentReport.rawText}
              </div>
            </div>

            {/* Extracted Events Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Extracted Execution Events ({reportEvents.length})
                </span>
                <span className="text-xs text-slate-500">Click an event to view AI match breakdown</span>
              </div>

              <div className="space-y-2">
                {reportEvents.map((ev, idx) => {
                  const match = state.matches.get(ev.id) || ev.match;
                  const decision = match?.decision || 'UNMATCHED';
                  const conf = match ? (match.confidence * 100).toFixed(0) : '0';

                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        selectEvent(ev.id);
                        setActiveView('review');
                      }}
                      className="p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 transition cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-cyan-400">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-200 truncate">{ev.description}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          decision === 'ACCEPTED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          decision === 'AUTO_LINKED' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                          decision === 'PENDING_REVIEW' ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {decision} ({conf}%)
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 italic bg-slate-950/40 p-2 rounded border border-slate-800/60">
                        "{ev.sourceText}"
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1">
                        <div>Progress: <strong className="text-emerald-400">{ev.progress !== undefined ? `${ev.progress}%` : 'N/A'}</strong></div>
                        <div>Status: <strong className="text-cyan-300">{ev.status}</strong></div>
                        <div>Target: <strong className="text-slate-200">{match?.activityCode || 'None'}</strong></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl w-full max-w-xl p-6 space-y-4 border border-cyan-500/30 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
                <span>Upload & Process Field Report</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Need a test sample?</span>
                <button
                  type="button"
                  onClick={loadSampleDPR}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900 text-xs font-semibold"
                >
                  Load SIH Acceptance Sample
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Document Name</label>
                  <input
                    type="text"
                    placeholder="e.g. DPR-2026-09-16.pdf"
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Format Type</label>
                  <select
                    value={sourceType}
                    onChange={e => setSourceType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="PDF">PDF Daily Progress Report</option>
                    <option value="XLSX">Excel Spreadsheet (XLSX)</option>
                    <option value="CSV">CSV Log</option>
                    <option value="TXT">Text Note / Diary</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Discipline</label>
                <select
                  value={discipline}
                  onChange={e => setDiscipline(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="CIVIL">Civil Works</option>
                  <option value="PIPING">Piping Systems</option>
                  <option value="MECHANICAL">Mechanical Equipment</option>
                  <option value="ELECTRICAL">Electrical Distribution</option>
                  <option value="INSTRUMENTATION">Instrumentation & Control</option>
                  <option value="HSE">HSE</option>
                  <option value="GENERAL">General Site</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">Field Report Text Content</label>
                <textarea
                  rows={5}
                  placeholder="Paste free-text supervisor report or DPR summary here..."
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/25"
                >
                  Extract & Match Events
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

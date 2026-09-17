'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { FieldReport, DisciplineType } from '@/types/domain';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  Mic, 
  Search, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  X
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
    <div className="space-y-5 pb-16">
      {/* Top Bar */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-blue-50 text-blue-800 border border-blue-200">
              Document Management
            </span>
            <span className="text-xs text-slate-500 font-medium">{state.fieldReports.length} Reports Ingested</span>
          </div>
          <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">
            Unstructured Daily Progress Reports (DPR), Spreadsheets & Field Logs
          </h1>
          <p className="text-xs text-slate-600">
            Ingest unstructured site documentation from PDFs, Excel sheets, and supervisor notes to extract verified progress events.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-[#0f2744] hover:bg-[#1a365d] text-white text-xs font-semibold shadow-sm transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Field Report</span>
        </button>
      </div>

      {/* Grid Layout: Left List vs Right Document View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 4 cols: Reports List */}
        <div className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Ingested Documents
            </span>
            <span className="text-[11px] font-mono text-slate-500">{state.fieldReports.length} Files</span>
          </div>

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
                  className={`p-3 rounded cursor-pointer transition border space-y-1.5 text-xs ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      {rep.sourceType === 'PDF' && <FileText className="w-4 h-4 text-slate-600 shrink-0" />}
                      {rep.sourceType === 'XLSX' && <FileSpreadsheet className="w-4 h-4 text-emerald-700 shrink-0" />}
                      {rep.sourceType === 'TXT' && <FileText className="w-4 h-4 text-blue-700 shrink-0" />}
                      {rep.sourceType === 'AUDIO' && <Mic className="w-4 h-4 text-purple-700 shrink-0" />}
                      <span className="font-semibold text-slate-900 truncate">{rep.fileName}</span>
                    </div>

                    <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                      PROCESSED
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Date: {rep.reportDate}</span>
                    <span className="text-blue-700 font-mono font-bold">{evCount} Events</span>
                  </div>

                  <div className="text-[10px] text-slate-400 truncate">
                    Uploaded by: {rep.uploadedBy}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 cols: Document Viewer & Extracted Events Breakdown */}
        {currentReport && (
          <div className="lg:col-span-8 bg-white rounded-lg border border-slate-200 p-5 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Document Inspector</span>
                <h3 className="text-base font-bold text-slate-900">{currentReport.fileName}</h3>
                <span className="text-xs text-slate-500">Submitted by {currentReport.uploadedBy} • {currentReport.reportDate}</span>
              </div>

              <button
                onClick={() => setActiveView('review')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold transition self-start sm:self-auto"
              >
                <span>Go to Review Queue →</span>
              </button>
            </div>

            {/* Raw Text Box */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Raw Field Report Content</span>
              <div className="p-3.5 rounded bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                {currentReport.rawText}
              </div>
            </div>

            {/* Extracted Events Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Extracted Execution Events ({reportEvents.length})
                </span>
                <span className="text-[11px] text-slate-500">Click an event to view match breakdown</span>
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
                      className="p-3 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition cursor-pointer space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-900 truncate">{ev.description}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                          decision === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                          decision === 'AUTO_LINKED' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                          decision === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-900 border-amber-300' :
                          'bg-slate-100 text-slate-700 border-slate-300'
                        }`}>
                          {decision.replace(/_/g, ' ')} ({conf}%)
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                        “{ev.sourceText}”
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-500 pt-1 font-mono">
                        <div>Progress: <strong className="text-slate-800">{ev.progress !== undefined ? `${ev.progress}%` : 'N/A'}</strong></div>
                        <div>Status: <strong className="text-slate-800">{ev.status}</strong></div>
                        <div>Target: <strong className="text-blue-700">{match?.activityCode || 'None'}</strong></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white rounded-lg border border-slate-300 w-full max-w-xl p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-blue-700" />
                <span>Upload &amp; Process Field Report</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200">
                <span className="text-slate-600">Need a demonstration sample?</span>
                <button
                  type="button"
                  onClick={loadSampleDPR}
                  className="px-2.5 py-1 rounded bg-white border border-slate-300 text-blue-700 font-semibold hover:bg-slate-50"
                >
                  Load Sample DPR
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">Document Name</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    placeholder="DPR-2026-09-16.pdf"
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">Format</label>
                  <select
                    value={sourceType}
                    onChange={e => setSourceType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="PDF">PDF Daily Report</option>
                    <option value="XLSX">Excel Spreadsheet (.xlsx)</option>
                    <option value="CSV">CSV Data Log</option>
                    <option value="TXT">Plain Text Site Diary</option>
                    <option value="AUDIO">Voice Recording Transcript</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">Primary Discipline</label>
                  <select
                    value={discipline}
                    onChange={e => setDiscipline(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="CIVIL">Civil</option>
                    <option value="PIPING">Piping</option>
                    <option value="MECHANICAL">Mechanical</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="INSTRUMENTATION">Instrumentation</option>
                    <option value="HSE">HSE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 uppercase">Uploaded By</label>
                  <input
                    type="text"
                    value={uploadedBy}
                    onChange={e => setUploadedBy(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-slate-300 bg-white text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 uppercase">Report Content / Excerpt Text</label>
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="Paste unstructured daily report log here..."
                  className="w-full p-2.5 rounded border border-slate-300 bg-white font-mono text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!rawText.trim()}
                  className="px-4 py-1.5 rounded bg-[#0f2744] hover:bg-[#1a365d] text-white font-semibold shadow-sm disabled:opacity-50"
                >
                  Ingest &amp; Extract Events
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

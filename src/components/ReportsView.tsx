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

  const getDisciplineColor = (disc?: DisciplineType | string) => {
    switch (disc) {
      case 'CIVIL':
        return 'border-l-4 border-l-amber-500 bg-amber-50/20';
      case 'PIPING':
        return 'border-l-4 border-l-sky-500 bg-sky-50/20';
      case 'MECHANICAL':
        return 'border-l-4 border-l-purple-500 bg-purple-50/20';
      case 'ELECTRICAL':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50/20';
      default:
        return 'border-l-4 border-l-slate-400 bg-stone-50/20';
    }
  };

  return (
    <div className="space-y-5 pb-16 font-mono">
      {/* Top Bar */}
      <div className="bg-white rounded-none border-[1.5px] border-slate-900 p-4 shadow-[2px_2px_0px_#0f172a] flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t-4 border-t-blue-600">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 border border-slate-900 inline-block"></span>
            <span className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider bg-stone-100 text-slate-900 border border-slate-900">
              [DOCUMENT_INGESTION_HUB]
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              [{state.fieldReports.length} REPORTS_INGESTED]
            </span>
          </div>
          <h1 className="text-base md:text-lg font-black tracking-tight text-slate-950 uppercase font-mono">
            UNSTRUCTURED DAILY PROGRESS REPORTS (DPR) &amp; FIELD LOGS
          </h1>
          <p className="text-xs text-slate-700 font-sans leading-relaxed">
            Ingest unstructured site documentation from PDFs, Excel sheets, and supervisor notes to extract verified progress events.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-none bg-black hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider border-[1.5px] border-black shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>[UPLOAD_FIELD_REPORT]</span>
        </button>
      </div>

      {/* Grid Layout: Left List vs Right Document View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 4 cols: Reports List */}
        <div className="lg:col-span-4 bg-white rounded-none border-[1.5px] border-slate-900 p-4 space-y-3 shadow-[2px_2px_0px_#0f172a] border-t-4 border-t-slate-900">
          <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
            <span className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
              {'// INGESTED_DOCUMENTS'}
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-700 bg-stone-100 px-1.5 py-0.5 border border-slate-300">
              [{state.fieldReports.length} FILES]
            </span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {state.fieldReports.map(rep => {
              const isSelected = rep.id === currentReport?.id;
              const evCount = state.events.filter(e => e.fieldReportId === rep.id).length;
              const discClass = getDisciplineColor(rep.discipline);

              return (
                <div
                  key={rep.id}
                  onClick={() => {
                    setSelectedReportId(rep.id);
                    selectReport(rep.id);
                  }}
                  className={`p-3 rounded-none cursor-pointer transition border-[1.5px] space-y-1.5 text-xs font-mono ${discClass} ${
                    isSelected
                      ? 'border-black shadow-[2px_2px_0px_#000] ring-2 ring-black'
                      : 'border-slate-300 hover:border-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      {rep.sourceType === 'PDF' && <FileText className="w-4 h-4 text-slate-900 shrink-0" />}
                      {rep.sourceType === 'XLSX' && <FileSpreadsheet className="w-4 h-4 text-emerald-800 shrink-0" />}
                      {rep.sourceType === 'TXT' && <FileText className="w-4 h-4 text-blue-800 shrink-0" />}
                      {rep.sourceType === 'AUDIO' && <Mic className="w-4 h-4 text-purple-800 shrink-0" />}
                      <span className="font-bold text-slate-950 truncate uppercase">{rep.fileName}</span>
                    </div>

                    <span className="px-1.5 py-0.2 rounded-none text-[9px] font-black bg-emerald-100 text-emerald-950 border border-emerald-500 shrink-0">
                      PROCESSED
                    </span>
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-700 font-mono">
                    <span>DATE: [{rep.reportDate}]</span>
                    <span className="text-slate-950 font-bold bg-white px-1 border border-slate-300">
                      [{evCount} EVENTS]
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-600 truncate font-mono">
                    AUTH: {rep.uploadedBy}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 cols: Document Viewer & Extracted Events Breakdown */}
        {currentReport && (
          <div className="lg:col-span-8 bg-white rounded-none border-[1.5px] border-slate-900 p-5 space-y-5 shadow-[2px_2px_0px_#0f172a] border-t-4 border-t-slate-900 font-mono">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-[1.5px] border-slate-900 pb-3">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 font-mono">
                  {'// DOCUMENT_INSPECTOR'}
                </span>
                <h3 className="text-sm md:text-base font-black text-slate-950 uppercase font-mono">
                  [{currentReport.fileName}]
                </h3>
                <span className="text-[10px] text-slate-600 font-mono">
                  Submitted by {currentReport.uploadedBy} · {currentReport.reportDate}
                </span>
              </div>

              <button
                onClick={() => setActiveView('review')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-amber-300 hover:bg-amber-400 border-[1.5px] border-slate-900 text-black text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0px_#0f172a] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition self-start sm:self-auto"
              >
                <span>[OPEN_REVIEW_QUEUE →]</span>
              </button>
            </div>

            {/* Raw Text Box */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider font-mono">
                {'// RAW_FIELD_REPORT_TERMINAL_STREAM:'}
              </span>
              <div className="p-3 rounded-none bg-stone-900 text-amber-300 border-[1.5px] border-slate-900 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto shadow-[1px_1px_0px_#0f172a]">
                {currentReport.rawText}
              </div>
            </div>

            {/* Extracted Events Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-2">
                <span className="text-xs font-black text-slate-950 uppercase tracking-wider font-mono">
                  {'// EXTRACTED_EXECUTION_EVENTS'} ({reportEvents.length})
                </span>
                <span className="text-[10px] text-slate-600 font-mono">Click event to open match workstation</span>
              </div>

              <div className="space-y-2">
                {reportEvents.map((ev, idx) => {
                  const match = state.matches.get(ev.id) || ev.match;
                  const decision = match?.decision || 'UNMATCHED';
                  const conf = match ? (match.confidence * 100).toFixed(0) : '0';

                  const eventCardBorder = 
                    decision === 'ACCEPTED' ? 'border-l-[5px] border-l-emerald-600 bg-emerald-50/25 hover:bg-emerald-100/40' :
                    decision === 'PENDING_REVIEW' ? 'border-l-[5px] border-l-amber-500 bg-amber-50/25 hover:bg-amber-100/40' :
                    'border-l-[5px] border-l-purple-600 bg-purple-50/25 hover:bg-purple-100/40';

                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        selectEvent(ev.id);
                        setActiveView('review');
                      }}
                      className={`p-3 rounded-none border-[1.5px] border-slate-300 hover:border-slate-900 transition cursor-pointer space-y-2 text-xs font-mono shadow-[1px_1px_0px_#0f172a] ${eventCardBorder}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded-none bg-black text-white flex items-center justify-center text-[10px] font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-950 uppercase truncate font-sans">{ev.description}</span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-wider border ${
                          decision === 'ACCEPTED' ? 'bg-emerald-200 text-emerald-950 border-emerald-600' :
                          decision === 'AUTO_LINKED' ? 'bg-blue-200 text-blue-950 border-blue-600' :
                          decision === 'PENDING_REVIEW' ? 'bg-amber-300 text-black border-slate-900' :
                          'bg-purple-200 text-purple-950 border-purple-600'
                        }`}>
                          [{decision.replace(/_/g, ' ')} : {conf}%]
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-800 italic bg-white p-2 rounded-none border-l-2 border-slate-900 font-sans">
                        &quot;{ev.sourceText}&quot;
                      </p>

                      <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-700 pt-1 font-mono">
                        <div>PROGRESS: <strong className="text-slate-950">{ev.progress !== undefined ? `${ev.progress}%` : 'N/A'}</strong></div>
                        <div>STATUS: <strong className="text-slate-950">{ev.status}</strong></div>
                        <div>TARGET_CODE: <strong className="text-blue-800 underline">[{match?.activityCode || 'NONE'}]</strong></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 font-mono">
          <div className="bg-white rounded-none border-[2px] border-slate-900 w-full max-w-xl p-6 space-y-4 shadow-[4px_4px_0px_#000] text-xs">
            <div className="flex items-center justify-between border-b-[1.5px] border-slate-900 pb-3">
              <h3 className="text-sm font-black text-slate-950 flex items-center gap-2 uppercase font-mono">
                <UploadCloud className="w-4 h-4 text-blue-700" />
                <span>{'// UPLOAD_&_PROCESS_FIELD_REPORT'}</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-900 hover:bg-stone-100 p-1 border border-slate-900">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="flex justify-between items-center bg-amber-50 p-2 rounded-none border border-slate-900">
                <span className="text-slate-800 text-[10px] font-bold uppercase">NEED DEMONSTRATION SAMPLE?</span>
                <button
                  type="button"
                  onClick={loadSampleDPR}
                  className="px-2.5 py-1 rounded-none bg-amber-300 hover:bg-amber-400 border border-slate-900 text-black font-bold uppercase text-[10px] shadow-[1px_1px_0px_#000]"
                >
                  [LOAD_SAMPLE_DPR]
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-900 uppercase">DOCUMENT_NAME</label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    placeholder="DPR-2026-09-16.pdf"
                    className="w-full px-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-stone-50 text-slate-950 font-mono text-xs focus:bg-white focus:outline-none shadow-[1px_1px_0px_#0f172a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-900 uppercase">FORMAT</label>
                  <select
                    value={sourceType}
                    onChange={e => setSourceType(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-stone-50 text-slate-950 font-mono text-xs focus:bg-white focus:outline-none shadow-[1px_1px_0px_#0f172a]"
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
                  <label className="text-[10px] font-bold text-slate-900 uppercase">PRIMARY_DISCIPLINE</label>
                  <select
                    value={discipline}
                    onChange={e => setDiscipline(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-stone-50 text-slate-950 font-mono text-xs focus:bg-white focus:outline-none shadow-[1px_1px_0px_#0f172a]"
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
                  <label className="text-[10px] font-bold text-slate-900 uppercase">UPLOADED_BY</label>
                  <input
                    type="text"
                    value={uploadedBy}
                    onChange={e => setUploadedBy(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-none border-[1.5px] border-slate-900 bg-stone-50 text-slate-950 font-mono text-xs focus:bg-white focus:outline-none shadow-[1px_1px_0px_#0f172a]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-900 uppercase">REPORT_CONTENT / EXCERPT</label>
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={e => setRawText(e.target.value)}
                  placeholder="Paste unstructured daily report log here..."
                  className="w-full p-2.5 rounded-none border-[1.5px] border-slate-900 bg-stone-50 font-mono text-xs text-slate-950 focus:bg-white focus:outline-none shadow-[1px_1px_0px_#0f172a]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t-[1.5px] border-slate-900">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-none border border-slate-900 hover:bg-stone-100 text-slate-900 font-bold uppercase text-xs"
                >
                  [CANCEL]
                </button>
                <button
                  type="submit"
                  disabled={!rawText.trim()}
                  className="px-4 py-1.5 rounded-none bg-black hover:bg-slate-800 text-white font-bold uppercase text-xs border border-black shadow-[2px_2px_0px_#0f172a] disabled:opacity-50"
                >
                  [INGEST_&amp;_EXTRACT]
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

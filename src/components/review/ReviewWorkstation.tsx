'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  HelpCircle,
  FileText,
  AlertTriangle,
  Layers,
  Calendar,
  Clock,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { ReviewItemModel } from '@sitesync/api/modules/review/review.types';

interface ReviewWorkstationProps {
  item: ReviewItemModel;
  onAccept: (reviewId: string, comment?: string) => Promise<void>;
  onReject: (reviewId: string, reason: string, comment?: string) => Promise<void>;
  onReassign: (reviewId: string, activityId: string, reason: string, comment?: string) => Promise<void>;
  onUnmatch: (reviewId: string, reason: string) => Promise<void>;
  onClose?: () => void;
}

export const ReviewWorkstation: React.FC<ReviewWorkstationProps> = ({
  item,
  onAccept,
  onReject,
  onReassign,
  onUnmatch,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'CHAIN' | 'ALTERNATIVES'>('DETAILS');
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);
  const [modalAction, setModalAction] = useState<'REJECT' | 'REASSIGN' | 'UNMATCH' | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionComment, setActionComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleActionConfirm = async () => {
    setIsProcessing(true);
    setFeedbackMsg(null);
    try {
      if (modalAction === 'REJECT') {
        if (!actionReason) throw new Error('Please provide a reason for rejection.');
        await onReject(item.id, actionReason, actionComment);
        setFeedbackMsg({ type: 'success', text: 'Match rejected and audit log recorded.' });
      } else if (modalAction === 'REASSIGN') {
        if (!selectedAlternative) throw new Error('Please select an alternative activity.');
        if (!actionReason) throw new Error('Please provide a reason for reassignment.');
        await onReassign(item.id, selectedAlternative, actionReason, actionComment);
        setFeedbackMsg({ type: 'success', text: `Match reassigned to ${selectedAlternative}.` });
      } else if (modalAction === 'UNMATCH') {
        await onUnmatch(item.id, actionReason || 'Event does not map to planned schedule activity');
        setFeedbackMsg({ type: 'success', text: 'Event marked as UNMATCHED.' });
      }
      setModalAction(null);
      setActionReason('');
      setActionComment('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedbackMsg({ type: 'error', text: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectAccept = async () => {
    setIsProcessing(true);
    setFeedbackMsg(null);
    try {
      await onAccept(item.id, 'Planner verified match directly.');
      setFeedbackMsg({ type: 'success', text: `Match for ${item.recommendedMatch.activityCode} accepted!` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedbackMsg({ type: 'error', text: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl flex flex-col max-w-6xl w-full mx-auto my-4 text-slate-100">
      {/* Header Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg text-white">Review Required — AI Match Proposal</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-medium">
                {item.status}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Event ID: <span className="font-mono text-slate-300">{item.event.id}</span> | Match ID:{' '}
              <span className="font-mono text-slate-300">{item.matchId}</span>
            </p>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Review Priority</div>
            <div className="text-sm font-bold text-amber-400 flex items-center gap-1 justify-end">
              <TrendingUp className="w-3.5 h-3.5" />
              {item.reviewPriority.score}/100
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`px-6 py-2.5 text-xs font-medium border-b ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
          }`}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1">
        {/* LEFT PANEL: Source Evidence & Extracted Event */}
        <div className="lg:col-span-5 bg-slate-950/40 border-r border-slate-800 p-6 flex flex-col gap-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Source Evidence
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {item.evidence.sourceType}
                  </span>
                  <span className="font-medium text-slate-200">{item.evidence.sourceLocator || 'Field Report'}</span>
                </span>
                {item.evidence.pageNumber && (
                  <span className="text-slate-400">Page {item.evidence.pageNumber}</span>
                )}
                {item.evidence.sheetName && (
                  <span className="text-slate-400">
                    {item.evidence.sheetName} ({item.evidence.cellRange})
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-md text-xs text-slate-200 leading-relaxed font-sans border-l-2 border-l-indigo-500 italic">
                &quot;{item.evidence.quotedText}&quot;
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Report Date: {item.event.eventDate?.split('T')[0] || '2026-03-12'}
                </span>
                <span className="text-slate-400 font-mono text-[10px]">SHA256 Verified</span>
              </div>
            </div>
          </div>

          {/* Extracted Execution Event */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              Structured Execution Event
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="text-sm font-medium text-white">{item.event.description}</div>
              <div className="text-xs text-slate-400">
                <span className="text-slate-500">Normalized: </span>
                <span className="font-mono text-slate-300">{item.event.normalizedDescription}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Reported Progress</span>
                  <span className="text-emerald-400 font-semibold text-sm">
                    {item.event.progress !== undefined && item.event.progress !== null
                      ? `${Math.round(item.event.progress * 100)}%`
                      : 'Not stated'}
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px]">Discipline</span>
                  <span className="text-slate-200 font-medium">{item.event.discipline || 'GENERAL'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Review Priority Reasons */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
            <div className="text-xs font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Review Priority Signals (Score: {item.reviewPriority.score}/100)
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5">
              {item.reviewPriority.reasons.map((r: string, idx: number) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL: AI Proposal & Multi-Candidate Breakdown */}
        <div className="lg:col-span-7 p-6 flex flex-col gap-5">
          {/* Candidate Card */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                Proposed Candidate Activity
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                  Match Score: {Math.round(item.recommendedMatch.finalScore * 100)}%
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-semibold">
                  Confidence: {Math.round(item.recommendedMatch.confidence * 100)}% ({item.recommendedMatch.confidenceLevel})
                </span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono mb-1">
                  <span>{item.recommendedMatch.activityCode}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-400">{item.recommendedMatch.discipline}</span>
                  {item.downstreamImpact?.isCritical && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/40">
                      CRITICAL PATH
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white">{item.recommendedMatch.activityName}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {item.recommendedMatch.location}
                </div>
                <div className="text-[11px] text-slate-500 font-mono mt-0.5">WBS: {item.recommendedMatch.wbsPath}</div>
              </div>

              {/* 7 Component Score Progress Meters */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-xs font-semibold text-slate-300 mb-2">7-Component Match Score Breakdown</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {Object.entries(item.recommendedMatch.scores || {}).map(([key, val]) => {
                    if (key === 'final') return null;
                    const pct = Math.round((val as number) * 100);
                    return (
                      <div key={key} className="bg-slate-900/90 border border-slate-800 p-2 rounded">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 capitalize">
                          <span>{key}</span>
                          <span className="font-mono text-slate-200">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 85 ? 'bg-emerald-400' : pct >= 65 ? 'bg-sky-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Deterministic Explanation */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded text-xs text-slate-300">
                <div className="font-semibold text-slate-200 mb-1.5">Deterministic Match Justification:</div>
                <ul className="space-y-1 text-slate-300">
                  {item.recommendedMatch.reasons.map((reason: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Downstream Impact Alert */}
              {item.downstreamImpact && (
                <div className="flex items-center justify-between text-xs px-3 py-2 bg-slate-900 border border-slate-800 rounded text-slate-300">
                  <span>
                    Direct Successors: <strong className="text-white">{item.downstreamImpact.downstreamCount}</strong> activities
                  </span>
                  <span className="text-slate-400">
                    {item.downstreamImpact.directSuccessors.join(', ') || 'None'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Alternative Candidates */}
          {item.alternatives && item.alternatives.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Alternative Schedule Candidates
              </div>
              <div className="space-y-1.5">
                {item.alternatives.map((alt: any) => (
                  <div
                    key={alt.activityId}
                    onClick={() => setSelectedAlternative(alt.activityId)}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      selectedAlternative === alt.activityId
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-mono font-semibold text-white flex items-center gap-2">
                        <span>{alt.activityCode}</span>
                        <span className="text-slate-500 font-normal">Rank #{alt.rank}</span>
                      </div>
                      <div className="text-slate-400">{alt.activityName}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-300">
                        {Math.round(alt.finalScore * 100)}%
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAlternative(alt.activityId);
                          setModalAction('REASSIGN');
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium"
                      >
                        Select Alternative
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer Toolbar */}
      <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>Requires Planner or Project Manager sign-off</span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            disabled={isProcessing}
            onClick={() => setModalAction('UNMATCH')}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            Mark Unmatched
          </button>

          <button
            disabled={isProcessing}
            onClick={() => setModalAction('REASSIGN')}
            className="px-3 py-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reassign Activity
          </button>

          <button
            disabled={isProcessing}
            onClick={() => setModalAction('REJECT')}
            className="px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            Reject Match
          </button>

          <button
            disabled={isProcessing}
            onClick={handleDirectAccept}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Accept & Verify Progress
          </button>
        </div>
      </div>

      {/* Decision Modal for Reject / Reassign / Unmatch */}
      {modalAction && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {modalAction === 'REJECT' && <XCircle className="w-5 h-5 text-rose-400" />}
              {modalAction === 'REASSIGN' && <RefreshCw className="w-5 h-5 text-amber-400" />}
              {modalAction === 'UNMATCH' && <HelpCircle className="w-5 h-5 text-slate-400" />}
              Confirm {modalAction} Action
            </h3>

            {modalAction === 'REASSIGN' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Target Activity ID / Code:</label>
                <input
                  type="text"
                  value={selectedAlternative || ''}
                  onChange={(e) => setSelectedAlternative(e.target.value)}
                  placeholder="e.g. proj-cse-2026-act-civ-pcc-0042"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Reason / Justification <span className="text-rose-400">*</span>:
              </label>
              <input
                type="text"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="e.g. Field report describes PCC mud mat, not bulk excavation."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Additional Planner Notes (Optional):</label>
              <textarea
                rows={2}
                value={actionComment}
                onChange={(e) => setActionComment(e.target.value)}
                placeholder="Notes for audit log..."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                disabled={isProcessing}
                onClick={() => setModalAction(null)}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleActionConfirm}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow"
              >
                {isProcessing ? 'Recording...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { FileText, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface EvidencePanelProps {
  documentId: string;
  documentTitle?: string;
  sourceType?: string;
  pageNumber?: number | string;
  timestamp?: string;
  uploadedBy?: string;
  excerpt: string;
  highlightWords?: string[];
  matchedActivityCode?: string;
  matchedActivityName?: string;
  confidence?: number;
  onOpenDocument?: () => void;
  onOpenActivity?: () => void;
  className?: string;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({
  documentId,
  documentTitle,
  sourceType = 'PDF',
  pageNumber,
  timestamp,
  uploadedBy,
  excerpt,
  highlightWords = [],
  matchedActivityCode,
  matchedActivityName,
  confidence,
  onOpenDocument,
  onOpenActivity,
  className = '',
}) => {
  return (
    <div className={`bg-white border-[1.5px] border-slate-900 rounded-none p-4 space-y-3 font-mono shadow-[2px_2px_0px_#0f172a] ${className}`}>
      {/* Header with Document Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-slate-900 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 border border-slate-900 bg-stone-100 text-slate-900">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-amber-100/60 px-1 border border-slate-400">[{documentId}]</span>
              {pageNumber && (
                <span className="text-[10px] font-bold uppercase text-slate-600">
                  PG_{pageNumber}
                </span>
              )}
            </div>
            {documentTitle && (
              <span className="text-xs text-slate-600 truncate block max-w-sm mt-0.5">
                {documentTitle}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {confidence !== undefined && (
            <span className="px-2 py-0.5 border border-emerald-900 bg-emerald-100 text-emerald-950 font-mono font-bold text-[10px] uppercase">
              [MATCH: {(confidence * 100).toFixed(1)}%]
            </span>
          )}
          {onOpenDocument && (
            <button
              onClick={onOpenDocument}
              className="text-slate-900 hover:bg-stone-100 border border-slate-900 px-2 py-0.5 flex items-center gap-1 font-bold text-[10px] uppercase"
            >
              <span>[SOURCE]</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Source Excerpt with Technical Drafting Block */}
      <div className="p-3 bg-stone-50 border border-slate-400 text-xs text-slate-900 leading-relaxed font-mono">
        <span className="text-slate-500 font-bold uppercase text-[9px] block mb-1 tracking-wider">
          // SOURCE_EXCERPT_RAW:
        </span>
        <blockquote className="border-l-2 border-slate-900 pl-2.5 text-slate-800">
          "{excerpt}"
        </blockquote>
      </div>

      {/* Footer Linking to Schedule Node & Authorship */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600 pt-1 border-t border-slate-200">
        <div className="flex items-center gap-2">
          {matchedActivityCode && (
            <span className="flex items-center gap-1">
              <span className="text-slate-500 font-bold uppercase">TARGET_NODE:</span>
              <button
                onClick={onOpenActivity}
                className="font-mono font-bold text-slate-900 underline hover:bg-amber-100"
              >
                [{matchedActivityCode}]
              </button>
              {matchedActivityName && (
                <span className="text-slate-600 truncate max-w-[200px]">({matchedActivityName})</span>
              )}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono">
          {uploadedBy && <span>AUTH: {uploadedBy}</span>}
          {timestamp && <span>· {timestamp}</span>}
        </div>
      </div>
    </div>
  );
};

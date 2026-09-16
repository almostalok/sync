'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  CopilotResponse,
  CopilotCitation,
  CopilotCalculation,
  GroundingStatus,
} from '@/types/domain';
import { copilotService } from '../../apps/api/src/modules/copilot';
import {
  Sparkles,
  Send,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Clock,
  ArrowRight,
  Bot,
  User,
  ExternalLink,
  X,
  AlertTriangle,
  Calculator,
  Database,
  Layers,
  Search,
  BookOpen,
  Info,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'COPILOT';
  text: string;
  timestamp: string;
  intent?: string;
  confidence?: number;
  groundingStatus?: GroundingStatus;
  citations?: CopilotCitation[];
  calculations?: CopilotCalculation[];
  suggestedActions?: string[];
  warnings?: string[];
  latencyMs?: number;
}

export const CopilotView: React.FC = () => {
  const { state, setActiveView } = useProject();
  const [inputQuery, setInputQuery] = useState('');
  const [selectedCitation, setSelectedCitation] = useState<CopilotCitation | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [isThinking, setIsThinking] = useState(false);

  // Dynamic suggested questions based on real live state
  const [suggestedQuestions, setSuggestedQuestions] = useState<{ question: string; category: string }[]>([]);

  useEffect(() => {
    const questions = copilotService.generateSuggestedQuestions({
      activities: state.activities,
      reports: state.fieldReports,
      events: state.events,
      risks: state.risks,
      historicalOutcomes: state.historicalOutcomes,
    });
    setSuggestedQuestions(questions);
  }, [state.activities, state.fieldReports, state.events, state.risks, state.historicalOutcomes]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'MSG-INIT',
      sender: 'COPILOT',
      text: `### Welcome to SiteSync Grounded Project Copilot
I am your enterprise project execution intelligence assistant for **${state.project.name}**.
Every answer I provide is strictly grounded in verified L5/L6 schedule activities, daily field reports (DPRs), dependency graph topology, and Oil India institutional memory.

**Non-Negotiable Guarantee**: Zero hallucinated dates, activities, or progress. If evidence is absent, I will explicitly notify you.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 1.0,
      groundingStatus: 'GROUNDED',
      citations: [
        {
          sourceType: 'SCHEDULE',
          sourceId: state.project.id,
          title: `Project Baseline: ${state.project.name}`,
          excerpt: `Actual Progress: ${state.project.actualProgress}% | Planned: ${state.project.plannedProgress}% | Data Version: 182`,
          relevanceScore: 1.0,
        },
      ],
      suggestedActions: [
        'Why is compressor foundation work delayed?',
        'What changed today?',
        'Which updates still need planner review?',
        'How long did similar foundation activities take in previous projects?',
      ],
    },
  ]);

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `USER-${Date.now()}`,
      sender: 'USER',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      const response: CopilotResponse = await copilotService.query(
        {
          projectId: state.project.id,
          userId: 'lead-planner',
          question: q,
        },
        {
          project: state.project,
          activities: state.activities,
          dependencies: state.dependencies,
          reports: state.fieldReports,
          events: state.events,
          risks: state.risks,
          historicalOutcomes: state.historicalOutcomes,
        }
      );

      const copilotMsg: ChatMessage = {
        id: `COPILOT-${Date.now()}`,
        sender: 'COPILOT',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        intent: response.intent,
        confidence: response.confidence,
        groundingStatus: response.groundingStatus,
        citations: response.citations,
        calculations: response.calculations,
        suggestedActions: response.suggestedActions,
        warnings: response.warnings,
        latencyMs: response.latencyMs,
      };

      setMessages((prev) => [...prev, copilotMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ERR-${Date.now()}`,
        sender: 'COPILOT',
        text: `**Grounding Error**: I couldn't find enough verified project data to answer that reliably (${err.message || 'Scope mismatch'}).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidence: 0.0,
        groundingStatus: 'INSUFFICIENT',
        warnings: ['Retrieval failure or out-of-scope question.'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-5 pb-12 relative">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 bg-[#0a0f1d]/90">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Grounded Project Copilot</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Master Prompt 8 • Level 1 Grounding Engine</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Evidence-First Schedule & Execution Reasoning
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong className="text-emerald-400">Strict Read-Only:</strong> Authoritative data cannot be mutated by AI
            </span>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1 font-mono">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Snap v.182</span>
          </div>
        </div>
      </div>

      {/* Suggested Quick Questions Pill Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap flex items-center gap-1">
          <Info className="w-3 h-3 text-cyan-400" /> Suggested:
        </span>
        {suggestedQuestions.map((sq, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sq.question)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition flex items-center gap-1.5 shrink-0"
          >
            <span>{sq.question}</span>
            <ArrowRight className="w-3 h-3 text-cyan-400 opacity-60" />
          </button>
        ))}
      </div>

      {/* Main Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Chat Thread */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 border border-slate-800 flex flex-col h-[680px] bg-[#070b14]">
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'COPILOT' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4 text-purple-300" />
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-2xl p-4 space-y-3 ${
                    msg.sender === 'USER'
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Status header for Copilot responses */}
                  {msg.sender === 'COPILOT' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/80 text-[10px]">
                      <div className="flex items-center gap-2">
                        {msg.groundingStatus === 'GROUNDED' && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>GROUNDED</span>
                          </span>
                        )}
                        {msg.groundingStatus === 'PARTIAL' && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-400" />
                            <span>PARTIAL EVIDENCE</span>
                          </span>
                        )}
                        {msg.groundingStatus === 'INSUFFICIENT' && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-400 font-bold flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            <span>INSUFFICIENT DATA</span>
                          </span>
                        )}
                        {msg.intent && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                            {msg.intent}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-slate-400 font-mono">
                        {msg.confidence !== undefined && (
                          <span>Confidence: {(msg.confidence * 100).toFixed(0)}%</span>
                        )}
                        {msg.latencyMs !== undefined && <span>• {msg.latencyMs}ms</span>}
                      </div>
                    </div>
                  )}

                  {/* Message Markdown Content */}
                  <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                    {msg.text.split('\n\n').map((para, pIdx) => {
                      if (para.startsWith('### ')) {
                        return (
                          <h4 key={pIdx} className="font-bold text-sm text-cyan-300 pt-1 border-b border-slate-800/50 pb-1">
                            {para.replace('### ', '')}
                          </h4>
                        );
                      }
                      if (para.startsWith('#### ')) {
                        return (
                          <h5 key={pIdx} className="font-bold text-xs text-slate-100 pt-1">
                            {para.replace('#### ', '')}
                          </h5>
                        );
                      }
                      return (
                        <p key={pIdx} className="text-slate-300 text-xs">
                          {para}
                        </p>
                      );
                    })}
                  </div>

                  {/* Deterministic Calculations Cards */}
                  {msg.calculations && msg.calculations.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                        <Calculator className="w-3 h-3" />
                        <span>Deterministic System Calculations</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.calculations.map((calc, cIdx) => (
                          <div
                            key={cIdx}
                            className="p-2.5 rounded-xl bg-[#0b1222] border border-slate-800 text-[11px] space-y-1"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-slate-300">{calc.name}</span>
                              <span className="font-mono font-bold text-cyan-300 text-xs">
                                {calc.value} {calc.unit || ''}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                              {calc.formula}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Evidence Citations (Prompt Section 17 & 18) */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          <span>Verified Evidence Citations ({msg.citations.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Click to inspect source drawer</span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((cit, citIdx) => (
                          <button
                            key={citIdx}
                            onClick={() => setSelectedCitation(cit)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0c1527] hover:bg-cyan-950/60 border border-cyan-900/60 hover:border-cyan-500 text-left text-[11px] transition flex items-center gap-1.5 group"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:scale-125 transition"></span>
                            <span className="font-semibold text-slate-200 group-hover:text-cyan-200">
                              [{cit.title.slice(0, 32)}...]
                            </span>
                            {cit.locator?.page && (
                              <span className="text-[10px] text-slate-400 font-mono">p.{cit.locator.page}</span>
                            )}
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400 group-hover:text-cyan-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Follow-up Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleSend(act)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 text-[11px] font-medium transition"
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Warnings if any */}
                  {msg.warnings && msg.warnings.length > 0 && (
                    <div className="pt-1 text-[10px] text-amber-400/90 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>{msg.warnings[0]}</span>
                    </div>
                  )}

                  <div className="text-[9px] text-slate-500 text-right">{msg.timestamp}</div>
                </div>

                {msg.sender === 'USER' && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-900 border border-cyan-500/60 flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-4 h-4 text-cyan-200" />
                  </div>
                )}
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3 text-xs justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-700/60 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-purple-300 animate-pulse" />
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Querying structured schedule, field reports, and institutional memory...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Copilot about delays, today's DPR, review queue, or historical lessons..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isThinking}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-out Source Drawer (Prompt Section 38) */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0a0f1d] border-l border-slate-800 h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-slate-200 text-sm">Source Evidence Drawer</h3>
                </div>
                <button
                  onClick={() => setSelectedCitation(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Source Details */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Source Type</span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-700/60 text-purple-300 font-mono font-bold">
                      {selectedCitation.sourceType}
                    </span>
                    <span className="text-slate-400 font-mono">{selectedCitation.sourceId}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Title</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{selectedCitation.title}</p>
                </div>

                {selectedCitation.discipline && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Discipline</span>
                    <p className="text-slate-300 mt-0.5">{selectedCitation.discipline}</p>
                  </div>
                )}

                {selectedCitation.locator && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Document Locator</span>
                    <div className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] text-cyan-300 space-y-0.5">
                      {selectedCitation.locator.page && <div>Page: {selectedCitation.locator.page}</div>}
                      {selectedCitation.locator.line && <div>Line: {selectedCitation.locator.line}</div>}
                      {selectedCitation.locator.sheet && <div>Sheet: {selectedCitation.locator.sheet}</div>}
                      {selectedCitation.locator.cell && <div>Cell: {selectedCitation.locator.cell}</div>}
                    </div>
                  </div>
                )}

                {selectedCitation.excerpt && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Primary Quoted Evidence</span>
                    <div className="mt-1 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 italic text-[11px] leading-relaxed">
                      "{selectedCitation.excerpt}"
                    </div>
                  </div>
                )}

                {selectedCitation.verifiedBy && (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-emerald-300 text-[11px] space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Audit Provenance Verified</span>
                    </div>
                    <div>Verified Authority: {selectedCitation.verifiedBy}</div>
                    {selectedCitation.verifiedAt && <div>Date: {selectedCitation.verifiedAt}</div>}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-800 flex gap-2">
              <button
                onClick={() => {
                  setSelectedCitation(null);
                  setActiveView('review');
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition text-center"
              >
                Inspect in Review Queue
              </button>
              <button
                onClick={() => {
                  setSelectedCitation(null);
                  setActiveView('gantt');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition text-center"
              >
                View in Gantt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

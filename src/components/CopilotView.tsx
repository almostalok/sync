'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { queryGroundedCopilot, CopilotResponse } from '@/lib/ai/copilotEngine';
import { 
  Sparkles, 
  Send, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Lightbulb, 
  ArrowRight,
  Bot,
  User
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'USER' | 'COPILOT';
  text: string;
  timestamp: string;
  evidence?: CopilotResponse['evidence'];
  suggestedActions?: string[];
}

export const CopilotView: React.FC = () => {
  const { state, setActiveView } = useProject();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'MSG-INIT',
      sender: 'COPILOT',
      text: `### Welcome to SiteSync Grounded Project Copilot

I am your evidence-first schedule intelligence assistant. I strictly reason across verified L5/L6 activities, DPR field reports, dependency networks, and historical benchmarks.

Ask me about **project delays**, **review queue items**, **field execution summaries**, or **downstream dependency impacts**.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'Why is the project delayed?',
        'Which activities need review?',
        'What happened on 16-Sep-2026?',
        'What caused similar delays in previous projects?'
      ]
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `USER-${Date.now()}`,
      sender: 'USER',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const response = queryGroundedCopilot(q, {
        project: state.project,
        activities: state.activities,
        dependencies: state.dependencies,
        reports: state.fieldReports,
        events: state.events,
        risks: state.risks,
        historicalOutcomes: state.historicalOutcomes,
        reviewQueueCount: state.events.filter(e => e.match?.decision === 'PENDING_REVIEW').length,
      });

      const copilotMsg: ChatMessage = {
        id: `COPILOT-${Date.now()}`,
        sender: 'COPILOT',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        evidence: response.evidence,
        suggestedActions: response.suggestedActions,
      };

      setMessages(prev => [...prev, copilotMsg]);
      setIsThinking(false);
    }, 400);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Grounded Copilot Engine</span>
            </span>
            <span className="text-xs text-slate-400">Section 22 • Zero Hallucination Guarantee</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Natural Language Project Reality & Dependency Reasoning
          </h2>
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl">
          <span className="text-emerald-400 font-bold">100% Citing Truth:</span> Field DPRs & Schedule Graph
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="glass-card rounded-2xl p-5 space-y-4 max-w-4xl mx-auto border border-slate-800 flex flex-col h-[650px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map(msg => (
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
                className={`max-w-2xl rounded-2xl p-4 space-y-3 ${
                  msg.sender === 'USER'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {msg.text.split('\n\n').map((para, pIdx) => {
                    if (para.startsWith('### ')) {
                      return <h4 key={pIdx} className="font-bold text-sm text-cyan-300 pt-1">{para.replace('### ', '')}</h4>;
                    }
                    if (para.startsWith('#### ')) {
                      return <h5 key={pIdx} className="font-bold text-xs text-slate-100 pt-1">{para.replace('#### ', '')}</h5>;
                    }
                    return <p key={pIdx} className="text-slate-300 text-xs">{para}</p>;
                  })}
                </div>

                {/* Evidence Citations */}
                {msg.evidence && msg.evidence.length > 0 && (
                  <div className="pt-3 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Evidence Citations & Source Provenance</span>
                    </span>
                    <div className="space-y-1.5">
                      {msg.evidence.map((ev, eIdx) => (
                        <div key={eIdx} className="p-2 rounded-lg bg-[#080d18] border border-slate-800 text-[11px] space-y-0.5">
                          <div className="font-semibold text-slate-200 flex justify-between">
                            <span>{ev.title}</span>
                            {ev.sourceReport && (
                              <span className="text-slate-400 font-mono text-[10px]">{ev.sourceReport} (p.{ev.sourcePage || 1})</span>
                            )}
                          </div>
                          <p className="italic text-slate-400 text-[10px]">"{ev.snippet}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Action Pills */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(act)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-[11px] font-medium transition"
                      >
                        {act}
                      </button>
                    ))}
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
                <span>Retrieving schedule graph and field evidence...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Copilot about delays, today's DPR, review items, or historical lessons..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
  );
};

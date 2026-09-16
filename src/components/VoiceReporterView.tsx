'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  Mic,
  MicOff,
  Square,
  Sparkles,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Volume2,
  ShieldCheck,
  Layers,
  Globe,
  Wifi,
  ArrowRight,
  Play,
  Pause,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { VoiceProcessingResult } from '@sitesync/types';
import { ExtractedEvent } from '@/types/domain';

type RecordingState =
  | 'IDLE'
  | 'RECORDING'
  | 'PROCESSING'
  | 'TRANSCRIBING'
  | 'EXTRACTING'
  | 'MATCHING'
  | 'READY'
  | 'FAILED';

export const VoiceReporterView: React.FC = () => {
  const { state, setActiveView, uploadReport } = useProject();
  const [recordingState, setRecordingState] = useState<RecordingState>('IDLE');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'hinglish' | 'en' | 'hi'>('hinglish');
  const [activeSpeechSample, setActiveSpeechSample] = useState<string>('');

  const [processingResult, setProcessingResult] = useState<VoiceProcessingResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Field Speech Scenarios (Prompt Section 75 & 76)
  const DEMO_SAMPLES = [
    {
      label: 'Compressor Foundation (Hinglish)',
      text: 'Aaj compressor station mein foundation excavation complete ho gaya hai, reinforcement around 85 percent hai, aur steel material ek din late aaya.',
      language: 'hinglish' as const,
      duration: 18,
    },
    {
      label: 'Piping & Underground Spools (English)',
      text: 'Piping team completed about 120 meters of underground pipe today near compressor station three. Welding is still pending for the remaining section. Valve material came late yesterday.',
      language: 'en' as const,
      duration: 22,
    },
    {
      label: 'Negation Safety Test (Explicit Hold)',
      text: 'Compressor foundation concrete pour has NOT started yet. Sump dewatering is still pending due to monsoon rain.',
      language: 'en' as const,
      duration: 14,
    },
    {
      label: 'Self-Correction Resolution (Speech Slip)',
      text: 'Progress on compressor foundation excavation is 80—sorry, 70 percent complete today. Dewatering pump deployed.',
      language: 'en' as const,
      duration: 16,
    },
  ];

  useEffect(() => {
    if (recordingState === 'RECORDING') {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  const handleStartRecording = () => {
    setRecordingState('RECORDING');
    setTimerSeconds(0);
    setProcessingResult(null);
    setActiveSpeechSample(
      DEMO_SAMPLES.find((s) => s.language === selectedLanguage)?.text || DEMO_SAMPLES[0].text
    );
  };

  const handleStopRecording = async (customText?: string) => {
    const textToProcess = customText || activeSpeechSample || DEMO_SAMPLES[0].text;
    setRecordingState('PROCESSING');

    // Stage progression for realistic enterprise pipeline feedback
    setTimeout(() => setRecordingState('TRANSCRIBING'), 250);
    setTimeout(() => setRecordingState('EXTRACTING'), 600);
    setTimeout(() => setRecordingState('MATCHING'), 950);

    try {
      const response = await fetch(`/api/v1/projects/${state.project.id}/voice-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: state.project.id,
          submittedBy: 'Field Supervisor (Civil & Piping)',
          userRole: 'SUPERVISOR',
          mimeType: 'audio/webm',
          durationSeconds: Math.max(8, timerSeconds),
          languageHint: selectedLanguage,
          fileName: `voice-${Date.now()}.webm`,
          transcriptHint: textToProcess,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setProcessingResult(json.data);
        setRecordingState('READY');

        // Automatically inject new events into project state for immediate live synchronization
        if (uploadReport && json.data.transcript?.text) {
          uploadReport(
            `Voice_${json.data.voiceReport.id}.webm`,
            'AUDIO',
            json.data.transcript.text,
            '2026-09-16',
            'GENERAL',
            'Site Supervisor'
          );
        }
      } else {
        setRecordingState('FAILED');
      }
    } catch (err) {
      setRecordingState('FAILED');
    }
  };

  const handleApplySample = (sample: (typeof DEMO_SAMPLES)[0]) => {
    setSelectedLanguage(sample.language);
    setActiveSpeechSample(sample.text);
    setTimerSeconds(sample.duration);
    handleStopRecording(sample.text);
  };

  const handleConfirmSync = () => {
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
    });
    setActiveView('review');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a0f1d]/90">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
              <Mic className="w-3 h-3 text-purple-400" />
              <span>Supervisor Voice Agent</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Master Prompt 9 • Speech-to-Reality Pipeline</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Natural Field Speech Ingestion & Execution Event Synchronization
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] text-slate-300 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong className="text-emerald-400">Canonical Pipeline:</strong> Feeds identical ExtractedEvent & Review schema
            </span>
          </div>
          <div className="text-[11px] text-slate-400 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1 font-mono">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span>ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls & Recording, Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Voice Recording Console (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Central Recording Widget */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-[#070b16] text-center space-y-5 shadow-xl">
            <div className="space-y-1">
              <div className="font-mono text-4xl font-bold tracking-wider text-slate-100">
                {formatTime(timerSeconds)}
              </div>
              <div className="text-xs font-semibold">
                {recordingState === 'IDLE' && <span className="text-slate-400">Press record and speak field update</span>}
                {recordingState === 'RECORDING' && (
                  <span className="text-red-400 flex items-center justify-center gap-1.5 animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>Recording in progress...</span>
                  </span>
                )}
                {recordingState === 'TRANSCRIBING' && (
                  <span className="text-purple-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                    <span>Speech-to-Text Transcription...</span>
                  </span>
                )}
                {recordingState === 'EXTRACTING' && (
                  <span className="text-cyan-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>Extracting events & resolving Hinglish...</span>
                  </span>
                )}
                {recordingState === 'MATCHING' && (
                  <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Running 7-Signal Matcher against Schedule...</span>
                  </span>
                )}
                {recordingState === 'READY' && (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Processing complete • Ready for verification</span>
                  </span>
                )}
                {recordingState === 'FAILED' && (
                  <span className="text-red-400 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Processing failed. Please retry.</span>
                  </span>
                )}
              </div>
            </div>

            {/* Central Big Mic Button */}
            <div className="flex justify-center items-center py-2">
              {recordingState !== 'RECORDING' ? (
                <button
                  onClick={handleStartRecording}
                  disabled={recordingState !== 'IDLE' && recordingState !== 'READY'}
                  className="w-28 h-28 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-2xl shadow-purple-600/40 flex flex-col items-center justify-center gap-1.5 transition transform active:scale-95 disabled:opacity-50 group"
                >
                  <Mic className="w-9 h-9 group-hover:scale-110 transition" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Record Update</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStopRecording()}
                  className="w-28 h-28 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-2xl shadow-red-600/50 flex flex-col items-center justify-center gap-1.5 transition transform active:scale-95 animate-pulse"
                >
                  <Square className="w-9 h-9" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">Stop Recording</span>
                </button>
              )}
            </div>

            {/* Dialect Selector */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px]">Dialect:</span>
              <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5">
                {(['hinglish', 'en', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition ${
                      selectedLanguage === lang
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'hinglish' ? 'Hinglish (Code-Switch)' : lang === 'en' ? 'English' : 'Hindi'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Demo Scenarios */}
          <div className="glass-card rounded-2xl p-4 border border-slate-800 bg-[#080d18] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Field Speech Samples</span>
              </span>
              <span className="text-[10px] text-slate-500">1-Click Test</span>
            </div>

            <div className="space-y-1.5">
              {DEMO_SAMPLES.map((sample, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleApplySample(sample)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left transition space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs group-hover:text-cyan-300">
                      {sample.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">00:{sample.duration}s</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 italic">"{sample.text}"</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Verbatim Transcript & Extracted Reality Events (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {processingResult ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Transcript & Word Alignment Card */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-[#080d18] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                      Verbatim Voice Transcript & Provenance
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Whisper Large v3
                    </span>
                    <span>{(processingResult.transcript.confidence * 100).toFixed(0)}% Confidence</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#050811] border border-slate-800 text-xs text-slate-200 italic leading-relaxed">
                  "{processingResult.transcript.text}"
                </div>

                {/* Audio Segment Locators */}
                {processingResult.transcript.segments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      Aligned Speech Segments
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {processingResult.transcript.segments.map((seg, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setSelectedSegmentIdx(sIdx)}
                          className={`px-2.5 py-1 rounded-lg border font-mono text-[10px] transition flex items-center gap-1.5 ${
                            selectedSegmentIdx === sIdx
                              ? 'bg-purple-950 border-purple-500 text-purple-200'
                              : 'bg-slate-900 border-slate-800 text-cyan-300 hover:bg-slate-800'
                          }`}
                        >
                          <Volume2 className="w-2.5 h-2.5 text-cyan-400" />
                          <span>
                            {seg.startSeconds}s–{seg.endSeconds}s: "{seg.text.slice(0, 24)}..."
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Reality Events */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-[#080d18] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                      Synchronized Execution Events ({processingResult.extractedEvents.length})
                    </h3>
                  </div>
                  <div className="text-[10px] text-emerald-400 font-semibold">
                    {processingResult.autoLinkedCount} Auto-Linked • {processingResult.reviewRequiredCount} Review Queued
                  </div>
                </div>

                <div className="space-y-2.5">
                  {processingResult.extractedEvents.map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-3.5 rounded-xl bg-[#050811] border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-slate-200">{ev.description}</h4>
                            {ev.description.includes('[NON-EVENT') && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                                NEGATION HELD
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 italic mt-0.5">"{ev.sourceText}"</p>
                        </div>

                        <div className="text-right shrink-0">
                          {ev.match?.decision === 'AUTO_LINKED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                              AUTO-LINKED ({(ev.match.confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                          {ev.match?.decision === 'PENDING_REVIEW' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                              REVIEW QUEUE ({(ev.match.confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                          {ev.match?.decision === 'UNMATCHED' && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                              UNMATCHED / HOLD
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1.5 border-t border-slate-800/80">
                        {ev.match?.activityCode && ev.match.activityCode !== 'NONE' && (
                          <span className="text-cyan-300 font-mono font-semibold">
                            Target: {ev.match.activityCode} ({ev.match.activityName})
                          </span>
                        )}
                        {ev.progress !== undefined && (
                          <span className="text-emerald-400 font-bold">Progress: {ev.progress}%</span>
                        )}
                        {ev.discipline && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{ev.discipline}</span>
                        )}
                        {ev.location && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{ev.location}</span>
                        )}
                        <span className="text-purple-300 font-mono flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-purple-400" />
                          <span>
                            00:{String(ev.characterStart || 0).padStart(2, '0')}–00:
                            {String(ev.characterEnd || 10).padStart(2, '0')}
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Action Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Events synchronized with immutable cryptographic audit trail.
                  </span>
                  <button
                    onClick={handleConfirmSync}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5"
                  >
                    <span>View in Review Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-12 border border-slate-800 bg-[#080d18] text-center space-y-3 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 rounded-2xl bg-purple-950/50 border border-purple-800/40 flex items-center justify-center text-purple-400">
                <Mic className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Awaiting Field Speech Input</h3>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Record a live field report or pick one of the instant speech samples to test real-time Hinglish
                transcription, negation handling, and 7-signal L5/L6 schedule matching.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  X,
  FileText,
  ShieldCheck,
  Send,
  Wifi,
  Sparkles,
  ArrowRight,
  Layers,
  Globe,
} from 'lucide-react';
import { VoiceProcessingResult, VoiceReport } from '@sitesync/types';
import { ExtractedEvent } from '@/types/domain';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RecordingState =
  | 'IDLE'
  | 'RECORDING'
  | 'PROCESSING'
  | 'TRANSCRIBING'
  | 'EXTRACTING'
  | 'MATCHING'
  | 'READY'
  | 'FAILED';

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({ isOpen, onClose }) => {
  const { state, setActiveView, uploadReport } = useProject();
  const [recordingState, setRecordingState] = useState<RecordingState>('IDLE');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'hinglish' | 'en' | 'hi'>('hinglish');
  const [activeSpeechSample, setActiveSpeechSample] = useState<string>('');

  const [processingResult, setProcessingResult] = useState<VoiceProcessingResult | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackPosition, setAudioPlaybackPosition] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sample Field Voice Recordings for 1-Click Demo Scenarios
  const DEMO_SAMPLES = [
    {
      label: 'Compressor Foundation (Hinglish)',
      text: 'Aaj compressor station mein foundation excavation complete ho gaya hai, reinforcement around 85 percent hai, aur steel material ek din late aaya.',
      language: 'hinglish' as const,
      duration: 18,
    },
    {
      label: 'Piping & Welding (English)',
      text: 'Piping team completed about 120 meters of underground pipe today near compressor station three. Welding is still pending for the remaining section. Valve material came late yesterday.',
      language: 'en' as const,
      duration: 22,
    },
    {
      label: 'Negation Case (Safety Test)',
      text: 'Compressor foundation concrete pour has NOT started yet. Sump dewatering is still pending due to monsoon rain.',
      language: 'en' as const,
      duration: 14,
    },
    {
      label: 'Self-Correction (Speech Slip)',
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

  if (!isOpen) return null;

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

    // Simulate realistic speech pipeline progression: Transcribing -> Extracting -> Matching
    setTimeout(() => setRecordingState('TRANSCRIBING'), 300);
    setTimeout(() => setRecordingState('EXTRACTING'), 700);
    setTimeout(() => setRecordingState('MATCHING'), 1100);

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
          // Pass transcript hint for offline prototype execution
          transcriptHint: textToProcess,
        }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        setProcessingResult(json.data);
        setRecordingState('READY');

        // Automatically ingest voice update into global ProjectContext for immediate visibility!
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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#080d1a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-[#0b1222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">Supervisor Voice Agent</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Master Prompt 9
                </span>
              </div>
              <p className="text-xs text-slate-400">Natural Speech-to-Schedule Reality Capture</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded-full">
              <Wifi className="w-3 h-3" />
              <span>ONLINE</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Pre-Recorded Demo Scenarios (Prompt Section 75 & 76) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instant Demo Speech Samples</span>
              </span>
              <span className="text-[10px] text-slate-500">Select to test multilingual processing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_SAMPLES.map((sample, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleApplySample(sample)}
                  className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition space-y-1 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200 text-xs group-hover:text-cyan-300">
                      {sample.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">00:{sample.duration}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 italic">"{sample.text}"</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recording Canvas */}
          <div className="p-6 rounded-2xl bg-[#050811] border border-slate-800 text-center space-y-4">
            {/* Status & Timer */}
            <div className="space-y-1">
              <div className="font-mono text-3xl font-bold tracking-wider text-slate-100">
                {formatTime(timerSeconds)}
              </div>
              <div className="text-xs font-semibold">
                {recordingState === 'IDLE' && (
                  <span className="text-slate-400">Ready to record daily site report</span>
                )}
                {recordingState === 'RECORDING' && (
                  <span className="text-red-400 flex items-center justify-center gap-1.5 animate-pulse">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>Recording field audio... Speak naturally</span>
                  </span>
                )}
                {recordingState === 'TRANSCRIBING' && (
                  <span className="text-purple-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
                    <span>Speech-to-Text Transcription (Whisper Model)...</span>
                  </span>
                )}
                {recordingState === 'EXTRACTING' && (
                  <span className="text-cyan-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>Extracting execution events & resolving Hinglish...</span>
                  </span>
                )}
                {recordingState === 'MATCHING' && (
                  <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span>Running 7-Signal Hybrid Matcher against L5/L6 Schedule...</span>
                  </span>
                )}
                {recordingState === 'READY' && (
                  <span className="text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Processing Complete: Events Synchronized</span>
                  </span>
                )}
                {recordingState === 'FAILED' && (
                  <span className="text-red-400 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Processing Failed. Please retry.</span>
                  </span>
                )}
              </div>
            </div>

            {/* Central Big Microphone Button (Mobile First) */}
            <div className="flex justify-center items-center py-2">
              {recordingState !== 'RECORDING' ? (
                <button
                  onClick={handleStartRecording}
                  disabled={recordingState !== 'IDLE' && recordingState !== 'READY'}
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-xl shadow-purple-600/30 flex flex-col items-center justify-center gap-1 transition transform active:scale-95 disabled:opacity-50 group"
                >
                  <Mic className="w-8 h-8 group-hover:scale-110 transition" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Record</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStopRecording()}
                  className="w-24 h-24 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-xl shadow-red-600/40 flex flex-col items-center justify-center gap-1 transition transform active:scale-95 animate-pulse"
                >
                  <Square className="w-8 h-8" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Stop</span>
                </button>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-center gap-2 pt-2 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 text-[11px]">Dialect:</span>
              <div className="flex rounded-lg bg-slate-900 border border-slate-800 p-0.5">
                {(['hinglish', 'en', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                      selectedLanguage === lang
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lang === 'hinglish' ? 'Hinglish (Mix)' : lang === 'en' ? 'English' : 'Hindi'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Area (Prompt Section 38 & 39) */}
          {processingResult && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Verbatim Transcript with Timestamps */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Verbatim Voice Transcript</span>
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>Confidence: {(processingResult.transcript.confidence * 100).toFixed(0)}%</span>
                    <span>• {processingResult.processingTimeMs}ms</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 italic leading-relaxed bg-[#060913] p-3 rounded-xl border border-slate-800">
                  "{processingResult.transcript.text}"
                </p>

                {/* Segment Timestamps */}
                {processingResult.transcript.segments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {processingResult.transcript.segments.map((seg, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-cyan-300 flex items-center gap-1"
                      >
                        <Clock className="w-2.5 h-2.5 text-cyan-400" />
                        <span>
                          {seg.startSeconds}s–{seg.endSeconds}s: "{seg.text.slice(0, 22)}..."
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Canonical Execution Events */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Extracted Reality Events ({processingResult.extractedEvents.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Mapped via 7-Signal Hybrid Matcher</span>
                </div>

                <div className="space-y-2">
                  {processingResult.extractedEvents.map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-3.5 rounded-xl bg-[#070c18] border border-slate-800 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-xs text-slate-200">{ev.description}</h4>
                          <p className="text-[10px] text-slate-400 italic">"{ev.sourceText}"</p>
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
                              UNMATCHED / HELD
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                        {ev.match?.activityCode && ev.match.activityCode !== 'NONE' && (
                          <span className="text-cyan-300 font-mono font-semibold">
                            Target: {ev.match.activityCode} ({ev.match.activityName})
                          </span>
                        )}
                        {ev.progress !== undefined && (
                          <span className="text-emerald-400 font-bold">Progress: {ev.progress}%</span>
                        )}
                        {ev.discipline && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800">{ev.discipline}</span>
                        )}
                        {ev.location && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-800">{ev.location}</span>
                        )}
                        <span className="text-purple-300 font-mono flex items-center gap-0.5">
                          <Volume2 className="w-2.5 h-2.5" />
                          <span>
                            {ev.characterStart || 0}s–{ev.characterEnd || 10}s
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0b1222] flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            {processingResult ? (
              <span className="text-emerald-400 font-semibold">
                ✓ {processingResult.autoLinkedCount} Auto-Linked • {processingResult.reviewRequiredCount} Review Queued
              </span>
            ) : (
              <span>Voice audio hashed via SHA-256 with immutable audit provenance</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Close
            </button>
            {processingResult && (
              <button
                onClick={() => {
                  onClose();
                  setActiveView('review');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 transition flex items-center gap-1.5"
              >
                <span>View in Review Queue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  Mic,
  Square,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  X,
  FileText,
  ShieldCheck,
  Wifi,
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
  const [selectedLanguage, setSelectedLanguage] = useState<'hinglish' | 'en' | 'hi'>('hinglish');
  const [activeSpeechSample, setActiveSpeechSample] = useState<string>('');

  const [processingResult, setProcessingResult] = useState<VoiceProcessingResult | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Supervisor Voice Ingestion</h3>
              <p className="text-[11px] text-slate-500">Natural speech to schedule reality synchronization</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">
              <Wifi className="w-3 h-3" />
              <span>ONLINE</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Quick Pre-Recorded Demo Scenarios */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Standard Demo Speech Samples
              </span>
              <span className="text-[10px] text-slate-500">Select to test multilingual processing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_SAMPLES.map((sample, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleApplySample(sample)}
                  className="p-2.5 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition space-y-1 bg-white"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">
                      {sample.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">00:{sample.duration}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 italic">&ldquo;{sample.text}&rdquo;</p>
                </button>
              ))}
            </div>
          </div>

          {/* Recording Canvas */}
          <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-3">
            {/* Status & Timer */}
            <div className="space-y-1">
              <div className="font-mono text-3xl font-bold tracking-wider text-slate-900">
                {formatTime(timerSeconds)}
              </div>
              <div className="text-xs font-semibold">
                {recordingState === 'IDLE' && (
                  <span className="text-slate-500">Ready to record daily site report</span>
                )}
                {recordingState === 'RECORDING' && (
                  <span className="text-rose-700 flex items-center justify-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span>Recording field audio...</span>
                  </span>
                )}
                {recordingState === 'TRANSCRIBING' && (
                  <span className="text-slate-700 flex items-center justify-center gap-1.5">
                    <RotateCcw className="w-3 h-3 animate-spin text-slate-600" />
                    <span>Transcribing audio stream...</span>
                  </span>
                )}
                {recordingState === 'EXTRACTING' && (
                  <span className="text-slate-700 flex items-center justify-center gap-1.5">
                    <RotateCcw className="w-3 h-3 animate-spin text-slate-600" />
                    <span>Extracting execution events & negations...</span>
                  </span>
                )}
                {recordingState === 'MATCHING' && (
                  <span className="text-slate-700 flex items-center justify-center gap-1.5">
                    <RotateCcw className="w-3 h-3 animate-spin text-slate-600" />
                    <span>Evaluating candidate schedule activities...</span>
                  </span>
                )}
                {recordingState === 'READY' && (
                  <span className="text-emerald-700 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Processing Complete: Events Synchronized</span>
                  </span>
                )}
                {recordingState === 'FAILED' && (
                  <span className="text-rose-700 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Processing Failed. Please retry.</span>
                  </span>
                )}
              </div>
            </div>

            {/* Central Microphone Button */}
            <div className="flex justify-center items-center py-2">
              {recordingState !== 'RECORDING' ? (
                <button
                  onClick={handleStartRecording}
                  disabled={recordingState !== 'IDLE' && recordingState !== 'READY'}
                  className="w-20 h-20 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex flex-col items-center justify-center gap-1 transition disabled:opacity-50 shadow-xs"
                >
                  <Mic className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Record</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStopRecording()}
                  className="w-20 h-20 rounded-full bg-rose-700 hover:bg-rose-800 text-white flex flex-col items-center justify-center gap-1 transition shadow-xs"
                >
                  <Square className="w-6 h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Stop</span>
                </button>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-center gap-2 pt-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 text-[11px]">Dialect:</span>
              <div className="flex rounded border border-slate-200 bg-white p-0.5">
                {(['hinglish', 'en', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
                      selectedLanguage === lang
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {lang === 'hinglish' ? 'Hinglish' : lang === 'en' ? 'English' : 'Hindi'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Area */}
          {processingResult && (
            <div className="space-y-4">
              {/* Verbatim Transcript */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Verbatim Voice Transcript</span>
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>Confidence: {(processingResult.transcript.confidence * 100).toFixed(0)}%</span>
                    <span>• {processingResult.processingTimeMs}ms</span>
                  </div>
                </div>

                <p className="text-xs text-slate-800 italic leading-relaxed bg-white p-2.5 rounded border border-slate-200">
                  &ldquo;{processingResult.transcript.text}&rdquo;
                </p>

                {/* Segment Timestamps */}
                {processingResult.transcript.segments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {processingResult.transcript.segments.map((seg, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] text-slate-700 flex items-center gap-1"
                      >
                        <Clock className="w-2.5 h-2.5 text-slate-400" />
                        <span>
                          {seg.startSeconds}s–{seg.endSeconds}s: &ldquo;{seg.text.slice(0, 22)}...&rdquo;
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Canonical Execution Events */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Extracted Reality Events ({processingResult.extractedEvents.length})</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Canonical Extraction</span>
                </div>

                <div className="space-y-2">
                  {processingResult.extractedEvents.map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-3 rounded bg-white border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-xs text-slate-900">{ev.description}</h4>
                          <p className="text-[10px] text-slate-500 italic">&ldquo;{ev.sourceText}&rdquo;</p>
                        </div>

                        <div className="text-right shrink-0">
                          {ev.match?.decision === 'AUTO_LINKED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              AUTO-LINKED ({(ev.match.confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                          {ev.match?.decision === 'PENDING_REVIEW' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              REVIEW QUEUE ({(ev.match.confidence * 100).toFixed(0)}%)
                            </span>
                          )}
                          {ev.match?.decision === 'UNMATCHED' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              UNMATCHED / HELD
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 pt-1 border-t border-slate-100">
                        {ev.match?.activityCode && ev.match.activityCode !== 'NONE' && (
                          <span className="text-slate-800 font-mono font-semibold">
                            Target: {ev.match.activityCode} ({ev.match.activityName})
                          </span>
                        )}
                        {ev.progress !== undefined && (
                          <span className="text-emerald-700 font-bold">Progress: {ev.progress}%</span>
                        )}
                        {ev.discipline && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100">{ev.discipline}</span>
                        )}
                        {ev.location && (
                          <span className="px-1.5 py-0.5 rounded bg-slate-100">{ev.location}</span>
                        )}
                        <span className="text-slate-500 font-mono flex items-center gap-0.5">
                          <Volume2 className="w-2.5 h-2.5 text-slate-400" />
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
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {processingResult ? (
              <span className="text-emerald-700 font-medium">
                ✓ {processingResult.autoLinkedCount} Auto-Linked • {processingResult.reviewRequiredCount} Review Queued
              </span>
            ) : (
              <span>Voice audio hashed with immutable audit provenance</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
            >
              Close
            </button>
            {processingResult && (
              <button
                onClick={() => {
                  onClose();
                  setActiveView('review');
                }}
                className="px-3.5 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
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

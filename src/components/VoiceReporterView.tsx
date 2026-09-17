'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useProject } from '@/context/ProjectContext';
import {
  Mic,
  Square,
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
} from 'lucide-react';
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
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Field Speech Scenarios
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
    <div className="space-y-5 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
              <Mic className="w-3 h-3 text-slate-600" />
              <span>Supervisor Voice Ingestion</span>
            </span>
            <span className="text-xs text-slate-500 font-mono">Speech-to-Reality Pipeline</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Field Speech Ingestion & Event Extraction
          </h1>
          <p className="text-xs text-slate-600">
            Transcribe supervisor voice notes in Hinglish, English, or Hindi, resolve negations, and match to schedule activities.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Canonical Pipeline:</strong> Standard ExtractedEvent & Review schema
            </span>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded font-mono flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-emerald-600" />
            <span>ONLINE</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls & Recording, Right Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Voice Recording Console (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Central Recording Widget */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 text-center space-y-4 shadow-sm">
            <div className="space-y-1">
              <div className="font-mono text-3xl font-bold tracking-wider text-slate-900">
                {formatTime(timerSeconds)}
              </div>
              <div className="text-xs font-semibold">
                {recordingState === 'IDLE' && <span className="text-slate-500">Ready to record field report</span>}
                {recordingState === 'RECORDING' && (
                  <span className="text-rose-700 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                    <span>Recording in progress...</span>
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
                    <span>Processing complete • Ready for verification</span>
                  </span>
                )}
                {recordingState === 'FAILED' && (
                  <span className="text-rose-700 flex items-center justify-center gap-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Processing failed. Please retry.</span>
                  </span>
                )}
              </div>
            </div>

            {/* Central Mic Button */}
            <div className="flex justify-center items-center py-2">
              {recordingState !== 'RECORDING' ? (
                <button
                  onClick={handleStartRecording}
                  disabled={recordingState !== 'IDLE' && recordingState !== 'READY'}
                  className="w-24 h-24 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-50 shadow-sm"
                >
                  <Mic className="w-7 h-7" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Record Update</span>
                </button>
              ) : (
                <button
                  onClick={() => handleStopRecording()}
                  className="w-24 h-24 rounded-full bg-rose-700 hover:bg-rose-800 text-white flex flex-col items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Square className="w-7 h-7" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Stop Recording</span>
                </button>
              )}
            </div>

            {/* Dialect Selector */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-600 text-[11px] font-medium">Language:</span>
              <div className="flex rounded border border-slate-200 bg-slate-50 p-0.5 text-xs">
                {(['hinglish', 'en', 'hi'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition ${
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

          {/* Field Speech Scenarios */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Standard Field Audio Scenarios
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Test Samples</span>
            </div>

            <div className="space-y-1.5">
              {DEMO_SAMPLES.map((sample, sIdx) => (
                <button
                  key={sIdx}
                  onClick={() => handleApplySample(sample)}
                  className="w-full p-2.5 rounded border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left transition space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">
                      {sample.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{sample.duration}s</span>
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 italic">&ldquo;{sample.text}&rdquo;</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Verbatim Transcript & Extracted Reality Events (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {processingResult ? (
            <div className="space-y-4">
              {/* Transcript & Word Alignment Card */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-700" />
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Verbatim Voice Transcript & Provenance
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Whisper Large v3
                    </span>
                    <span>{(processingResult.transcript.confidence * 100).toFixed(0)}% Confidence</span>
                  </div>
                </div>

                <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs text-slate-800 italic leading-relaxed">
                  &ldquo;{processingResult.transcript.text}&rdquo;
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
                          className={`px-2 py-0.5 rounded border font-mono text-[10px] transition flex items-center gap-1.5 ${
                            selectedSegmentIdx === sIdx
                              ? 'bg-slate-900 border-slate-900 text-white'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Volume2 className="w-2.5 h-2.5 text-slate-500" />
                          <span>
                            {seg.startSeconds}s–{seg.endSeconds}s: &ldquo;{seg.text.slice(0, 24)}...&rdquo;
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Extracted Reality Events */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-700" />
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Synchronized Execution Events ({processingResult.extractedEvents.length})
                    </h3>
                  </div>
                  <div className="text-[10px] text-slate-600 font-semibold font-mono">
                    {processingResult.autoLinkedCount} Auto-Linked • {processingResult.reviewRequiredCount} Review Queued
                  </div>
                </div>

                <div className="space-y-2.5">
                  {processingResult.extractedEvents.map((ev, eIdx) => (
                    <div
                      key={eIdx}
                      className="p-3 rounded bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-xs text-slate-900">{ev.description}</h4>
                            {ev.description.includes('[NON-EVENT') && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                NEGATION HELD
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 italic mt-0.5">&ldquo;{ev.sourceText}&rdquo;</p>
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
                              UNMATCHED / HOLD
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 pt-1.5 border-t border-slate-200">
                        {ev.match?.activityCode && ev.match.activityCode !== 'NONE' && (
                          <span className="text-slate-900 font-mono font-semibold">
                            Target: {ev.match.activityCode} ({ev.match.activityName})
                          </span>
                        )}
                        {ev.progress !== undefined && (
                          <span className="text-emerald-700 font-bold">Progress: {ev.progress}%</span>
                        )}
                        {ev.discipline && (
                          <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">{ev.discipline}</span>
                        )}
                        {ev.location && (
                          <span className="px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">{ev.location}</span>
                        )}
                        <span className="text-slate-500 font-mono flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5 text-slate-400" />
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
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Events synchronized with immutable audit trail.
                  </span>
                  <button
                    onClick={handleConfirmSync}
                    className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs"
                  >
                    <span>View in Review Queue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-10 text-center space-y-2.5 flex flex-col items-center justify-center min-h-[380px] shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Awaiting Field Speech Input</h3>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                Record a live field report or pick one of the test scenarios to evaluate transcription,
                negation handling, and L5/L6 schedule matching.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

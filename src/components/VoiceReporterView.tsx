'use client';

import React, { useState } from 'react';
import { useProject } from '@/context/ProjectContext';
import { normalizeFieldText } from '@/lib/ai/normalizer';
import { matchEventToActivities } from '@/lib/ai/hybridMatcher';
import { ExtractedEvent } from '@/types/domain';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Check, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Cpu, 
  Volume2 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const VoiceReporterView: React.FC = () => {
  const { state, uploadReport, setActiveView } = useProject();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [previewEvent, setPreviewEvent] = useState<ExtractedEvent | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const samplePhrases = [
    "Compressor foundation excavation is eighty-five percent complete. PCC will start tomorrow.",
    "Header spool twelve welding reached ninety percent progress. NDT inspection scheduled for night shift.",
    "Medium voltage cable pulling at Substation Yard achieved forty-five percent completion."
  ];

  const handleSimulateVoice = (phrase: string) => {
    setIsRecording(true);
    setTranscript('');
    setPreviewEvent(null);
    setIsConfirmed(false);

    let current = '';
    const words = phrase.split(' ');
    let idx = 0;

    const timer = setInterval(() => {
      if (idx < words.length) {
        current += (idx > 0 ? ' ' : '') + words[idx];
        setTranscript(current);
        idx++;
      } else {
        clearInterval(timer);
        setIsRecording(false);
        processVoiceTranscript(phrase);
      }
    }, 120);
  };

  const processVoiceTranscript = (text: string) => {
    const norm = normalizeFieldText(text);
    const event: ExtractedEvent = {
      id: `VOICE-EVT-${Date.now().toString().slice(-4)}`,
      fieldReportId: 'VOICE-STREAM',
      reportFileName: 'Voice_Supervisor_Memo.wav',
      description: norm.normalized.slice(0, 50).replace(/\b\w/g, l => l.toUpperCase()),
      normalizedDescription: norm.normalized,
      eventDate: '2026-09-16',
      discipline: norm.detectedDiscipline || 'CIVIL',
      location: norm.detectedLocation || 'Site Area',
      progress: norm.extractedProgress,
      status: norm.extractedStatus,
      sourceText: text,
      sourcePage: 1,
      extractionConfidence: 0.93,
      createdAt: new Date().toISOString(),
    };

    const match = matchEventToActivities(event, state.activities, 3);
    event.match = match;
    setPreviewEvent(event);
  };

  const handleConfirm = () => {
    if (!previewEvent) return;
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });

    uploadReport(
      'Voice_Supervisor_Memo.wav',
      'AUDIO',
      previewEvent.sourceText,
      '2026-09-16',
      previewEvent.discipline,
      'R. Sharma (Site Supervisor Voice)'
    );

    setIsConfirmed(true);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Field Supervisor Voice Memo
            </span>
            <span className="text-xs text-slate-400">Speech-To-Schedule Pipeline</span>
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            Natural Hands-Free Voice Progress Reporting
          </h2>
        </div>
      </div>

      {/* Voice Recorder Card */}
      <div className="glass-card rounded-2xl p-6 space-y-6 border border-slate-800 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <button
              onClick={() => handleSimulateVoice(samplePhrases[0])}
              disabled={isRecording}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform active:scale-95 shadow-2xl ${
                isRecording
                  ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/50'
                  : 'bg-gradient-to-tr from-cyan-600 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white shadow-cyan-500/30'
              }`}
            >
              {isRecording ? <Mic className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>
          <h3 className="text-sm font-bold text-slate-200">
            {isRecording ? 'Listening and Transcribing Field Audio...' : 'Tap Mic or Select Sample to Speak'}
          </h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            SiteSync transcribes voice input, extracts activities and progress, computes calibrated confidence, and allows one-click supervisor verification.
          </p>
        </div>

        {/* Sample Voice Quick Buttons */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Quick Voice Simulation Scenarios</span>
          <div className="flex flex-wrap justify-center gap-2">
            {samplePhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleSimulateVoice(phrase)}
                disabled={isRecording}
                className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 text-xs text-left max-w-xs truncate transition"
              >
                "{phrase}"
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Transcription Box */}
        {transcript && (
          <div className="p-4 rounded-xl bg-[#080d18] border border-slate-800 text-left space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Audio Transcript Stream</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Whisper ASR Live</span>
            </div>
            <p className="text-slate-100 font-mono text-xs leading-relaxed">
              "{transcript}"
            </p>
          </div>
        )}

        {/* Live Extracted & Matched Event Preview */}
        {previewEvent && (
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/40 text-left space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Live AI Match Preview</span>
                <h4 className="text-sm font-bold text-white">{previewEvent.match?.activityCode}: {previewEvent.match?.activityName}</h4>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Confidence</div>
                <div className="text-base font-black text-cyan-400">
                  {((previewEvent.match?.confidence || 0.93) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Progress</span>
                <span className="font-bold text-emerald-400">{previewEvent.progress}%</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Discipline</span>
                <span className="font-bold text-amber-300">{previewEvent.discipline}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Location</span>
                <span className="font-bold text-slate-300">{previewEvent.location}</span>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Status</span>
                <span className="font-bold text-cyan-300">{previewEvent.status}</span>
              </div>
            </div>

            {!isConfirmed ? (
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => setPreviewEvent(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Discard
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/25"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Voice Report & Ingest</span>
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Voice report confirmed & ingested into Review / Schedule pipeline!</span>
                </span>
                <button
                  onClick={() => setActiveView('review')}
                  className="underline hover:text-white"
                >
                  View in Review Queue →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

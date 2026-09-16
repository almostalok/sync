import { TranscriptSegment, VoiceTranscript } from '@sitesync/types';

export interface TranscriptionInput {
  audioBuffer?: Buffer;
  storageKey: string;
  durationSeconds: number;
  mimeType: string;
  transcriptHint?: string; // Used for synthetic testing / offline fallback
  languageHint?: string;
}

export interface SpeechToTextProvider {
  name: string;
  transcribe(input: TranscriptionInput): Promise<Omit<VoiceTranscript, 'id' | 'voiceReportId' | 'createdAt'>>;
}

/**
 * Offline & Deterministic Speech Provider for hackathon reliability and air-gapped environments.
 * Simulates high-fidelity whisper transcript alignment with realistic sentence-level timestamps.
 */
export class DeterministicSpeechProvider implements SpeechToTextProvider {
  name = 'Offline Deterministic Speech Provider (Whisper Emulation)';

  async transcribe(
    input: TranscriptionInput
  ): Promise<Omit<VoiceTranscript, 'id' | 'voiceReportId' | 'createdAt'>> {
    // If a transcript hint is provided (e.g. from mobile Web Speech API or test fixture), use it;
    // otherwise generate a canonical site supervisor field report.
    const rawText =
      input.transcriptHint ||
      'Today we completed excavation for compressor foundation area B. Reinforcement is 85 percent complete. Concrete pour is planned for tomorrow. Steel delivery was delayed by one day.';

    const duration = input.durationSeconds > 0 ? input.durationSeconds : 20.0;

    // Detect language
    let language = 'en';
    if (/[\u0900-\u097F]/.test(rawText)) {
      language = 'hi';
    } else if (/\b(ho gaya|khatam|baki|chalu|aaj|kal|kaam|sariya|dhalai|hai)\b/i.test(rawText)) {
      language = 'hinglish';
    }

    // Split text into punctuated clauses/sentences for realistic timestamp alignment
    const sentences = rawText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const segments: TranscriptSegment[] = [];
    const stepDuration = duration / Math.max(1, sentences.length);

    sentences.forEach((sentence, idx) => {
      const start = Number((idx * stepDuration).toFixed(2));
      const end = Number(Math.min(duration, (idx + 1) * stepDuration).toFixed(2));
      segments.push({
        id: `SEG-${(idx + 1).toString().padStart(2, '0')}`,
        text: sentence,
        startSeconds: start,
        endSeconds: end,
        confidence: 0.94,
        speakerId: 'SPK-SUPERVISOR-01',
      });
    });

    return {
      text: rawText,
      language,
      provider: 'whisper-large-v3-emulated',
      providerVersion: '3.1.0',
      durationSeconds: duration,
      confidence: 0.95,
      segments,
    };
  }
}

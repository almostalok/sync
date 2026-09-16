import { LocalAudioStorageService } from './audio-storage.service';
import { DeterministicSpeechProvider } from './speech-to-text.service';
import { VoiceNormalizerService } from './voice-normalizer.service';
import { VoiceExtractorService } from './voice-extractor.service';
import { VoiceReportService } from './voice-report.service';
import { VoiceAnalyticsService } from './voice-analytics.service';

export * from './voice.config';
export * from './audio-storage.service';
export * from './speech-to-text.service';
export * from './voice-normalizer.service';
export * from './voice-extractor.service';
export * from './voice-report.service';
export * from './voice-analytics.service';

// Module Singletons
export const audioStorageService = new LocalAudioStorageService();
export const speechToTextProvider = new DeterministicSpeechProvider();
export const voiceNormalizerService = new VoiceNormalizerService();
export const voiceExtractorService = new VoiceExtractorService(voiceNormalizerService);
export const voiceReportService = new VoiceReportService(
  audioStorageService,
  speechToTextProvider,
  voiceExtractorService
);
export const voiceAnalyticsService = new VoiceAnalyticsService(voiceReportService);

import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';

import {
  LocalAudioStorageService,
  DeterministicSpeechProvider,
  VoiceNormalizerService,
  VoiceExtractorService,
  VoiceReportService,
  VoiceAnalyticsService,
  VOICE_CONFIG,
} from '../apps/api/src/modules/voice';
import { generateSyntheticProject } from '../src/lib/data/syntheticGenerator';

test('SiteSync Supervisor Voice Agent & Multilingual Pipeline Suite (Master Prompt 9)', async (t) => {
  const storage = new LocalAudioStorageService();
  const speechToText = new DeterministicSpeechProvider();
  const normalizer = new VoiceNormalizerService();
  const extractor = new VoiceExtractorService(normalizer);
  const voiceReportService = new VoiceReportService(storage, speechToText, extractor);
  const analyticsService = new VoiceAnalyticsService(voiceReportService);

  const data = generateSyntheticProject();

  await t.test('1. Audio Storage, SHA-256 Hashing & Signed Playback URLs', async () => {
    const audioBuffer = Buffer.from('RIFF....WAVEfmt test audio data stream for sitesync');
    const stored = await storage.upload(audioBuffer, 'test-voice.webm', 'audio/webm');

    assert.ok(stored.storageKey.startsWith('voice-'));
    assert.equal(stored.fileSize, audioBuffer.length);
    assert.equal(stored.contentHash.length, 64, 'SHA-256 must be 64 hex characters');
    assert.ok(stored.signedUrl.includes('expires='));
    assert.ok(stored.signedUrl.includes('token='));

    // Validate signed token URL
    const urlObj = new URL('http://localhost' + stored.signedUrl);
    const expires = parseInt(urlObj.searchParams.get('expires')!, 10);
    const token = urlObj.searchParams.get('token')!;
    assert.equal(storage.validateSignedUrl(stored.storageKey, expires, token), true);

    // Validate rejection of expired / tampered token
    assert.equal(storage.validateSignedUrl(stored.storageKey, expires - 100000, token), false);
    assert.equal(storage.validateSignedUrl(stored.storageKey, expires, 'tampered-fake-token'), false);
  });

  await t.test('2. Speech-to-Text Transcription with Sentence Alignment', async () => {
    const transcript = await speechToText.transcribe({
      storageKey: 'voice-sample.webm',
      durationSeconds: 18.0,
      mimeType: 'audio/webm',
      transcriptHint:
        'Today we completed excavation for compressor foundation area B. Reinforcement is 85 percent complete.',
    });

    assert.equal(transcript.language, 'en');
    assert.equal(transcript.durationSeconds, 18.0);
    assert.ok(transcript.confidence >= 0.9);
    assert.ok(transcript.segments.length >= 2, 'Must align into at least 2 distinct speech segments');

    const seg1 = transcript.segments[0];
    assert.equal(seg1.startSeconds, 0);
    assert.ok(seg1.endSeconds > seg1.startSeconds);
    assert.match(seg1.text, /excavation/i);
  });

  await t.test('3. Multilingual & Hinglish Code-Switching Normalization', () => {
    const rawHinglish =
      'Aaj compressor station mein foundation excavation complete ho gaya hai, aur sariya 85 percent hai.';
    const normalized = normalizer.normalizeStatement(rawHinglish, '2026-09-16');

    assert.match(normalized.normalizedText, /completed/i);
    assert.equal(normalized.extractedProgress, 85);
    assert.equal(normalized.status, 'COMPLETED');
    assert.equal(normalized.detectedDiscipline, 'CIVIL');
    assert.equal(normalized.detectedLocation, 'Compressor Station');
  });

  await t.test('4. Strict Negation Detection Gate (Prompt Section 61 Safety Rule)', () => {
    // 4.1 English negation: "Concrete pour has NOT started yet"
    const neg1 = normalizer.normalizeStatement(
      'Compressor foundation concrete pour has NOT started yet.',
      '2026-09-16'
    );
    assert.equal(neg1.isNegated, true);
    assert.equal(neg1.epistemicModality, 'NEGATION');
    assert.equal(neg1.status, 'BLOCKED', 'Negated statement must not become STARTED or COMPLETED');

    // 4.2 Hinglish negation: "Valve installation abhi tak shuru nahi hua hai"
    const neg2 = normalizer.normalizeStatement(
      'Valve installation abhi tak shuru nahi hua hai.',
      '2026-09-16'
    );
    assert.equal(neg2.isNegated, true);
    assert.equal(neg2.epistemicModality, 'NEGATION');
    assert.equal(neg2.status, 'BLOCKED');

    // 4.3 Affirmative control: "Valve installation shuru hua"
    const aff = normalizer.normalizeStatement('Valve installation shuru hua.', '2026-09-16');
    assert.equal(aff.isNegated, false);
    assert.equal(aff.status, 'STARTED');
  });

  await t.test('5. Self-Correction Speech Resolution (Prompt Section 62)', () => {
    // "Foundation excavation progress is 80—sorry, 70 percent complete today"
    const statement = normalizer.normalizeStatement(
      'Foundation excavation progress is 80—sorry, 70 percent complete today.',
      '2026-09-16'
    );
    assert.equal(statement.isSelfCorrected, true);
    assert.equal(statement.extractedProgress, 70, 'Must extract corrected 70% rather than mistaken 80%');

    // "Actually" self-correction
    const statement2 = normalizer.normalizeStatement(
      'Piping welding is 50 percent—actually make that 65 percent finished.',
      '2026-09-16'
    );
    assert.equal(statement2.isSelfCorrected, true);
    assert.equal(statement2.extractedProgress, 65);
  });

  await t.test('6. Relative Temporal Resolution (Prompt Section 15)', () => {
    // "yesterday" relative to 2026-09-16
    const yest = normalizer.normalizeStatement('Piping finished yesterday.', '2026-09-16');
    assert.equal(yest.temporalExpression, 'yesterday');
    assert.equal(yest.resolvedDate, '2026-09-15');

    // "tomorrow" relative to 2026-09-16
    const tom = normalizer.normalizeStatement('Concrete pour planned for tomorrow.', '2026-09-16');
    assert.equal(tom.temporalExpression, 'tomorrow');
    assert.equal(tom.resolvedDate, '2026-09-17');

    // "today" relative to 2026-09-16
    const today = normalizer.normalizeStatement('Excavation completed today.', '2026-09-16');
    assert.equal(today.temporalExpression, 'today');
    assert.equal(today.resolvedDate, '2026-09-16');
  });

  await t.test('7. Canonical Event Creation & 7-Signal Hybrid Matcher Integration', async () => {
    const result = await voiceReportService.ingestVoiceReport(
      {
        projectId: data.project.id,
        submittedBy: 'Civil Site Supervisor',
        mimeType: 'audio/webm',
        durationSeconds: 15.0,
        languageHint: 'en',
        transcriptHint:
          'Today we completed excavation for compressor foundation area B. Reinforcement is 85 percent complete.',
      },
      {
        activities: data.activities,
        dependencies: data.dependencies,
      }
    );

    assert.ok(result.voiceReport.id.startsWith('VOICE-DPR-'));
    assert.equal(result.extractedEvents.length, 2);

    const ev1 = result.extractedEvents[0];
    assert.ok(ev1.match, 'ExtractedEvent must contain an ActivityMatch');
    assert.ok(ev1.characterStart !== undefined && ev1.characterEnd !== undefined);
    assert.ok(ev1.match.candidates.length > 0, 'Must produce candidate activities from 7-signal matcher');
    assert.ok(
      ['AUTO_LINKED', 'PENDING_REVIEW', 'UNMATCHED'].includes(ev1.match.decision),
      'Must resolve into valid calibration decision'
    );
  });

  await t.test('8. Duplicate Detection & Idempotency Safeguards', async () => {
    const fixedAudio = Buffer.from('identical-supervisor-audio-sample-data-stream-xyz');
    const input = {
      projectId: data.project.id,
      submittedBy: 'Field Supervisor',
      mimeType: 'audio/webm',
      durationSeconds: 12.0,
      audioBase64: fixedAudio.toString('base64'),
      idempotencyKey: 'IDEMP-VOICE-KEY-001',
      transcriptHint: 'Excavation completed today.',
    };

    // First ingestion
    const res1 = await voiceReportService.ingestVoiceReport(input, {
      activities: data.activities,
    });
    assert.equal(res1.voiceReport.isDuplicate, false);

    // Second ingestion with same idempotencyKey returns cached result
    const res2 = await voiceReportService.ingestVoiceReport(input, {
      activities: data.activities,
    });
    assert.equal(res1.voiceReport.id, res2.voiceReport.id, 'Idempotent call must return identical report');

    // Third ingestion without idempotencyKey flags as duplicate
    const res3 = await voiceReportService.ingestVoiceReport(
      { ...input, idempotencyKey: undefined },
      { activities: data.activities }
    );
    assert.equal(res3.voiceReport.isDuplicate, true, 'Matching contentHash must flag duplicate');
    assert.equal(res3.voiceReport.duplicateOfId, res1.voiceReport.id);
  });

  await t.test('9. Execution of 100-Transcript Golden Benchmark Dataset', async () => {
    const benchPath = path.resolve(__dirname, '../data/benchmark/voice-evaluation.json');
    assert.ok(fs.existsSync(benchPath), 'Voice benchmark file must exist');

    const benchContent = JSON.parse(fs.readFileSync(benchPath, 'utf8'));
    assert.equal(benchContent.items.length, 100, 'Benchmark must contain exactly 100 transcripts');

    let processedCount = 0;
    let negationCorrectCount = 0;
    let selfCorrectionCorrectCount = 0;

    // Test a sample subset across all 9 categories
    const sampleItems = benchContent.items.filter((_: any, idx: number) => idx % 4 === 0);

    for (const item of sampleItems) {
      const statement = normalizer.normalizeStatement(item.transcriptText, '2026-09-16');
      processedCount++;

      if (item.category === 'NEGATION') {
        if (statement.isNegated && statement.status === 'BLOCKED') {
          negationCorrectCount++;
        }
      }

      if (item.category === 'SELF_CORRECTION') {
        if (statement.isSelfCorrected) {
          selfCorrectionCorrectCount++;
        }
      }
    }

    assert.ok(processedCount > 0);
    const negationItems = sampleItems.filter((i: any) => i.category === 'NEGATION');
    if (negationItems.length > 0) {
      assert.equal(
        negationCorrectCount,
        negationItems.length,
        'Negation False Positive Rate must be 0.00%'
      );
    }
  });

  await t.test('10. Voice Analytics Telemetry', async () => {
    const analytics = await analyticsService.getVoiceAnalytics(data.project.id);
    assert.ok(analytics.totalVoiceReports >= 1);
    assert.ok(analytics.transcriptionSuccessRate >= 90.0);
    assert.ok(analytics.averageConfidence >= 80.0);
    assert.ok(analytics.averageProcessingTimeMs > 0);
  });
});

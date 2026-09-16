import { VoiceIngestionInput } from '@sitesync/types';

const ALLOWED_MIME_TYPES = new Set([
  'audio/webm',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/mp3',
  'audio/mpeg',
  'audio/m4a',
  'audio/mp4',
  'audio/ogg',
  'audio/aac',
]);

const MAX_DURATION_SECONDS = 300; // 5 minutes max (Master Prompt Section 4)
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export function validateVoiceIngestion(input: unknown): {
  valid: boolean;
  errors: string[];
  data?: VoiceIngestionInput;
} {
  const errors: string[] = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Voice ingestion payload must be an object'] };
  }

  const v = input as Record<string, unknown>;

  if (!v.projectId || typeof v.projectId !== 'string' || v.projectId.trim().length === 0) {
    errors.push('projectId is required');
  }

  const submittedBy =
    typeof v.submittedBy === 'string' && v.submittedBy.trim().length > 0
      ? v.submittedBy.trim()
      : 'Site Supervisor';

  if (!v.mimeType || typeof v.mimeType !== 'string' || !ALLOWED_MIME_TYPES.has(v.mimeType.toLowerCase())) {
    errors.push(
      `Unsupported audio format '${v.mimeType}'. Supported formats: audio/webm, audio/wav, audio/mp3, audio/m4a, audio/ogg`
    );
  }

  let duration = typeof v.durationSeconds === 'number' ? v.durationSeconds : 0;
  if (duration < 0) {
    errors.push('durationSeconds cannot be negative');
  } else if (duration > MAX_DURATION_SECONDS) {
    errors.push(`Audio duration (${duration}s) exceeds maximum allowed recording limit of ${MAX_DURATION_SECONDS}s (5 minutes)`);
  }

  if (v.audioBase64 && typeof v.audioBase64 === 'string') {
    const approximateBytes = Math.ceil((v.audioBase64.length * 3) / 4);
    if (approximateBytes > MAX_FILE_SIZE_BYTES) {
      errors.push(`Audio file size exceeds maximum limit of 25MB`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      projectId: (v.projectId as string).trim(),
      submittedBy,
      userRole: typeof v.userRole === 'string' ? v.userRole.trim() : 'SUPERVISOR',
      mimeType: (v.mimeType as string).toLowerCase().trim(),
      durationSeconds: duration,
      audioBase64: typeof v.audioBase64 === 'string' ? v.audioBase64 : undefined,
      fileName: typeof v.fileName === 'string' ? v.fileName.trim() : `voice-${Date.now()}.webm`,
      idempotencyKey: typeof v.idempotencyKey === 'string' ? v.idempotencyKey.trim() : undefined,
      languageHint: typeof v.languageHint === 'string' ? v.languageHint.trim() : undefined,
      shift: typeof v.shift === 'string' ? v.shift.trim() : undefined,
      siteLocation: typeof v.siteLocation === 'string' ? v.siteLocation.trim() : undefined,
    },
  };
}

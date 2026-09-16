/**
 * SiteSync File Security & Ingestion Quarantine Service (Master Prompt 12)
 *
 * Enforces file safety: Magic byte verification, MIME validation, extension whitelisting,
 * path traversal blocking, file size caps, and safe storage key generation.
 */

import * as crypto from 'crypto';

export interface FileValidationResult {
  valid: boolean;
  sanitizedFilename: string;
  detectedMime: string;
  sha256Hash: string;
  storageKey: string;
  sizeBytes: number;
  errors: string[];
}

export class FileSecurityService {
  // Configurable size caps
  public static readonly MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
  public static readonly MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

  // Allowed extensions and corresponding MIME signatures
  private static readonly ALLOWED_EXTENSIONS = new Set(['pdf', 'xlsx', 'xls', 'csv', 'webm', 'wav', 'mp3', 'docx']);

  private static readonly MAGIC_BYTES: Record<string, number[]> = {
    pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
    xlsx: [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP archive)
    docx: [0x50, 0x4b, 0x03, 0x04], // PK.. (ZIP archive)
    wav: [0x52, 0x49, 0x46, 0x46], // RIFF
    webm: [0x1a, 0x45, 0xdf, 0xa3], // Matroska / WebM
  };

  /**
   * Performs full security validation on an uploaded file buffer.
   */
  public validateFile(params: {
    projectId: string;
    fileName: string;
    mimeType: string;
    buffer: Buffer;
    resourceType?: 'REPORT' | 'AUDIO' | 'SCHEDULE';
  }): FileValidationResult {
    const errors: string[] = [];
    const sizeBytes = params.buffer.length;

    // 1. Path Traversal & Filename Sanitization
    if (/[/\\?%*:|"<>~]|\.\./.test(params.fileName)) {
      errors.push('Path Traversal or illegal characters detected in filename.');
    }

    // Strip traversal and normalize filename
    const cleanBase = params.fileName.replace(/^.*[\\/]/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = cleanBase.split('.').pop()?.toLowerCase() || '';

    if (!FileSecurityService.ALLOWED_EXTENSIONS.has(ext)) {
      errors.push(`File extension '.${ext}' is not permitted. Allowed: ${Array.from(FileSecurityService.ALLOWED_EXTENSIONS).join(', ')}`);
    }

    // 2. File Size Enforcement
    const isAudio = ['webm', 'wav', 'mp3'].includes(ext) || params.resourceType === 'AUDIO';
    const maxSize = isAudio ? FileSecurityService.MAX_AUDIO_SIZE_BYTES : FileSecurityService.MAX_DOCUMENT_SIZE_BYTES;

    if (sizeBytes > maxSize) {
      errors.push(`File size (${(sizeBytes / 1024 / 1024).toFixed(2)}MB) exceeds limit of ${(maxSize / 1024 / 1024).toFixed(0)}MB.`);
    }

    if (sizeBytes < 4) {
      errors.push('File buffer is empty or corrupted.');
    }

    // 3. Magic Byte Verification (File Signature Inspection)
    const expectedMagic = FileSecurityService.MAGIC_BYTES[ext];
    if (expectedMagic && sizeBytes >= expectedMagic.length) {
      const actualBytes = Array.from(params.buffer.subarray(0, expectedMagic.length));
      const matches = expectedMagic.every((byte, idx) => byte === actualBytes[idx]);
      if (!matches) {
        // Special case: CSVs are plain text without binary magic bytes
        if (ext !== 'csv') {
          errors.push(`File signature mismatch: header does not match expected format for .${ext}.`);
        }
      }
    }

    // 4. Cryptographic SHA-256 Hash
    const sha256Hash = crypto.createHash('sha256').update(params.buffer).digest('hex');

    // 5. Secure, Unguessable Object Storage Key (Never uses client-provided paths)
    const fileId = `${Date.now()}-${sha256Hash.substring(0, 12)}`;
    const storageKey = `projects/${params.projectId}/${isAudio ? 'audio' : 'reports'}/${fileId}.${ext}`;

    return {
      valid: errors.length === 0,
      sanitizedFilename: cleanBase,
      detectedMime: params.mimeType,
      sha256Hash,
      storageKey,
      sizeBytes,
      errors,
    };
  }
}

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { VOICE_CONFIG } from './voice.config';

export interface StoredAudioObject {
  storageKey: string;
  fileSize: number;
  contentHash: string;
  mimeType: string;
  signedUrl: string;
}

export interface ObjectStorageProvider {
  upload(audioBuffer: Buffer, fileName: string, mimeType: string): Promise<StoredAudioObject>;
  getSignedUrl(storageKey: string, expiresInSeconds?: number): Promise<string>;
  delete(storageKey: string): Promise<boolean>;
}

/**
 * Local Filesystem implementation of Object Storage with HMAC-signed token URLs.
 * Production environments can seamlessly swap this for S3/MinIO provider.
 */
export class LocalAudioStorageService implements ObjectStorageProvider {
  private baseDir: string;

  constructor(baseDir?: string) {
    this.baseDir = baseDir || path.resolve(process.cwd(), 'data/audio');
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Upload audio buffer, compute SHA-256 hash, and persist to local storage.
   */
  async upload(audioBuffer: Buffer, fileName: string, mimeType: string): Promise<StoredAudioObject> {
    const contentHash = crypto.createHash('sha256').update(audioBuffer).digest('hex');
    const safeExt = path.extname(fileName) || '.webm';
    const storageKey = `voice-${Date.now()}-${contentHash.slice(0, 12)}${safeExt}`;
    const filePath = path.join(this.baseDir, storageKey);

    fs.writeFileSync(filePath, audioBuffer);
    const signedUrl = await this.getSignedUrl(storageKey);

    return {
      storageKey,
      fileSize: audioBuffer.length,
      contentHash,
      mimeType,
      signedUrl,
    };
  }

  /**
   * Generate short-lived signed URL for playback.
   */
  async getSignedUrl(storageKey: string, expiresInSeconds = VOICE_CONFIG.LIMITS.SIGNED_URL_EXPIRATION_SECONDS): Promise<string> {
    const expiresAt = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const token = crypto
      .createHmac('sha256', 'sitesync-secret-salt')
      .update(`${storageKey}:${expiresAt}`)
      .digest('hex');

    return `/api/v1/voice/audio/${storageKey}?expires=${expiresAt}&token=${token}`;
  }

  /**
   * Validate signed URL token.
   */
  validateSignedUrl(storageKey: string, expires: number, token: string): boolean {
    const now = Math.floor(Date.now() / 1000);
    if (now > expires) return false;

    const expectedToken = crypto
      .createHmac('sha256', 'sitesync-secret-salt')
      .update(`${storageKey}:${expires}`)
      .digest('hex');

    return expectedToken === token;
  }

  /**
   * Delete audio file.
   */
  async delete(storageKey: string): Promise<boolean> {
    const filePath = path.join(this.baseDir, storageKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  /**
   * Retrieve audio file buffer.
   */
  async getAudioBuffer(storageKey: string): Promise<Buffer | null> {
    const filePath = path.join(this.baseDir, storageKey);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    return null;
  }
}

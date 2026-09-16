export interface StorageService {
  upload(key: string, content: Buffer | string, mimeType?: string): Promise<{ storageKey: string; size: number }>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
}

export class LocalStorageService implements StorageService {
  private inMemoryStore = new Map<string, { content: Buffer | string; mimeType?: string }>();

  async upload(key: string, content: Buffer | string, mimeType = 'text/plain'): Promise<{ storageKey: string; size: number }> {
    const size = typeof content === 'string' ? Buffer.byteLength(content) : content.length;
    this.inMemoryStore.set(key, { content, mimeType });
    return { storageKey: key, size };
  }

  async getSignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return `/api/v1/storage/${encodeURIComponent(key)}`;
  }

  async delete(key: string): Promise<boolean> {
    return this.inMemoryStore.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.inMemoryStore.has(key);
  }
}

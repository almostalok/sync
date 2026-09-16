/**
 * SiteSync Central Rate Limiter Service (Master Prompt 12)
 *
 * Enforces endpoint-category rate limits using a sliding window algorithm.
 * Protects AI inference and file upload endpoints against denial-of-service and cost spikes.
 */

export enum RateLimitCategory {
  GENERAL = 'GENERAL',
  AUTH = 'AUTH',
  UPLOAD = 'UPLOAD',
  COPILOT = 'COPILOT',
  VOICE = 'VOICE',
}

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export interface RateLimitStatus {
  allowed: boolean;
  category: RateLimitCategory;
  currentRequests: number;
  limit: number;
  remaining: number;
  retryAfterSeconds?: number;
}

export class RateLimiterService {
  private static readonly LIMIT_CONFIGS: Record<RateLimitCategory, RateLimitConfig> = {
    [RateLimitCategory.GENERAL]: { maxRequests: 120, windowSeconds: 60 },
    [RateLimitCategory.AUTH]: { maxRequests: 10, windowSeconds: 60 },
    [RateLimitCategory.UPLOAD]: { maxRequests: 15, windowSeconds: 60 },
    [RateLimitCategory.COPILOT]: { maxRequests: 25, windowSeconds: 60 },
    [RateLimitCategory.VOICE]: { maxRequests: 15, windowSeconds: 60 },
  };

  // In-memory sliding window timestamps: key -> number[]
  private static requestTimestamps: Map<string, number[]> = new Map();

  /**
   * Evaluates if a request from a client/user should be allowed.
   */
  public checkRateLimit(key: string, category: RateLimitCategory = RateLimitCategory.GENERAL): RateLimitStatus {
    const config = RateLimiterService.LIMIT_CONFIGS[category];
    const now = Date.now();
    const windowMs = config.windowSeconds * 1000;
    const bucketKey = `${category}:${key}`;

    let timestamps = RateLimiterService.requestTimestamps.get(bucketKey) || [];

    // Filter out timestamps outside the active sliding window
    timestamps = timestamps.filter((t) => now - t < windowMs);

    if (timestamps.length >= config.maxRequests) {
      const oldest = timestamps[0];
      const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);

      return {
        allowed: false,
        category,
        currentRequests: timestamps.length,
        limit: config.maxRequests,
        remaining: 0,
        retryAfterSeconds: Math.max(1, retryAfterSeconds),
      };
    }

    // Record this request
    timestamps.push(now);
    RateLimiterService.requestTimestamps.set(bucketKey, timestamps);

    return {
      allowed: true,
      category,
      currentRequests: timestamps.length,
      limit: config.maxRequests,
      remaining: config.maxRequests - timestamps.length,
    };
  }

  /**
   * Resets rate limits for a given key (used in testing).
   */
  public static reset(key?: string): void {
    if (key) {
      for (const k of RateLimiterService.requestTimestamps.keys()) {
        if (k.endsWith(`:${key}`)) RateLimiterService.requestTimestamps.delete(k);
      }
    } else {
      RateLimiterService.requestTimestamps.clear();
    }
  }
}

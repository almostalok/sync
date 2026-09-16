import { NextResponse } from 'next/server';
import { PrismaService } from '@/../apps/api/src/infrastructure/database/prisma.service';

export async function GET() {
  const startTime = Date.now();
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  // Check Database
  let dbStatus = 'HEALTHY';
  let dbLatencyMs = 0;
  try {
    const dbStart = Date.now();
    if (PrismaService.isAvailable()) {
      const prisma = PrismaService.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - dbStart;
    } else {
      dbStatus = 'IN_MEMORY_MODE';
    }
  } catch (err: any) {
    dbStatus = 'DEGRADED';
  }

  // Check Redis & Object Storage
  const redisStatus = process.env.REDIS_URL ? 'CONNECTED' : 'IN_MEMORY_FALLBACK';
  const storageStatus = process.env.STORAGE_ENDPOINT ? 'CONNECTED' : 'LOCAL_STORAGE';

  const isHealthy = dbStatus !== 'DOWN';

  return NextResponse.json(
    {
      status: isHealthy ? 'UP' : 'DOWN',
      timestamp: new Date().toISOString(),
      service: 'sitesync-api',
      version: '1.0.0',
      uptimeSeconds: Math.round(uptime),
      responseTimeMs: Date.now() - startTime,
      dependencies: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          mode: PrismaService.isAvailable() ? 'POSTGRESQL' : 'SYNTHETIC_MEMORY',
        },
        redis: {
          status: redisStatus,
          queueEngine: 'IN_MEMORY_OUTBOX',
        },
        storage: {
          status: storageStatus,
          provider: 'LOCAL_ATTACHED',
        },
      },
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        memoryUsageMb: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        },
      },
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Service-Name': 'SiteSync-Platform',
      },
    }
  );
}

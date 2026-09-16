import { NextResponse } from 'next/server';
import { PrismaService } from '@/../apps/api/src/infrastructure/database/prisma.service';

export async function GET() {
  let isReady = true;
  const checks: Record<string, string> = {
    app: 'READY',
  };

  try {
    if (PrismaService.isAvailable()) {
      const prisma = PrismaService.getInstance();
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'READY';
    } else {
      checks.database = 'READY_IN_MEMORY';
    }
  } catch {
    checks.database = 'NOT_READY';
    isReady = false;
  }

  return NextResponse.json(
    {
      status: isReady ? 'READY' : 'NOT_READY',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: isReady ? 200 : 503 }
  );
}

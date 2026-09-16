import { PrismaClient } from '@prisma/client';

export class PrismaService {
  private static instance: PrismaClient;

  public static isAvailable(): boolean {
    return Boolean(process.env.DATABASE_URL);
  }

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    }
    return PrismaService.instance;
  }
}

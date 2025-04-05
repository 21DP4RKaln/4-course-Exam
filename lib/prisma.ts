// lib/prisma.ts - Unified Prisma service
import { PrismaClient } from '@prisma/client';

// Add prisma to the NodeJS global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

/**
 * Singleton PrismaClient instance with connection management
 * This ensures only one instance is used across the application
 */
class PrismaService {
  private static instance: PrismaService;
  private client: PrismaClient;
  private isConnected = false;

  private constructor() {
    // Reuse PrismaClient instance in development to avoid multiple connections
    if (process.env.NODE_ENV === 'production') {
      this.client = new PrismaClient({
        log: ['error'],
      });
    } else {
      // In development, store PrismaClient in global object to prevent duplicates
      if (!global.prisma) {
        global.prisma = new PrismaClient({
          log: process.env.DEBUG_PRISMA === 'true' 
            ? ['query', 'error', 'warn'] 
            : ['error'],
        });
      }
      this.client = global.prisma;
    }
  }

  /**
   * Get the PrismaService singleton instance
   */
  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  /**
   * Get the PrismaClient instance
   */
  public getClient(): PrismaClient {
    return this.client;
  }

  /**
   * Connect to the database
   */
  public async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.$connect();
      this.isConnected = true;
      console.log('Connected to database');
    }
  }

  /**
   * Disconnect from the database
   */
  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.$disconnect();
      this.isConnected = false;
      console.log('Disconnected from database');
    }
  }

  /**
   * Execute a transaction
   */
  public async transaction<T>(callback: (tx: PrismaClient) => Promise<T>): Promise<T> {
    return this.client.$transaction(async (tx) => {
      return callback(tx as unknown as PrismaClient);
    });
  }
}

// Initialize the service
const prismaService = PrismaService.getInstance();

// Connect to database
if (process.env.NODE_ENV !== 'test') {
  prismaService.connect()
    .catch(e => {
      console.error('Failed to connect to database', e);
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    });
}

// Handle disconnection on process shutdown
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', () => {
    prismaService.disconnect();
  });
}

// Export the Prisma client instance
const prisma = prismaService.getClient();
export default prisma;

// Export service for advanced usage
export { prismaService };
import { Prisma, PrismaClient } from '@prisma/client';
import { ReadonlyClient } from './ReadonlyPrisma';

// This is the home of all database operations through prisma
// It is used from both the node-server package (which runs tasks) and from the sveltekit
// app itself. The goal is that prisma write operations should never be allowed directly
// from another package, but should instead utilize operator methods from here, which will
// handle "Form" verifications before performing writes. If implemented correctly, all
// these writes should be successful anyway, but we want to guarantee that at runtime.
// Therefore, we create a read-only version of the prisma client that can be passed out to
// other packages, but we keep the writable client behind the abstraction layer.
if (!process.env.DATABASE_URL)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore This is necessary for sveltekit, where import.meta.env will in fact exist
  process.env.DATABASE_URL = import.meta.env ? import.meta.env.DATABASE_URL : undefined;

const prismaInternal = new PrismaClient();

export type PrismaClientExact = PrismaClient;

export const DatabaseReads = prismaInternal.$extends(ReadonlyClient);

class ConnectionChecker {
  private connected: boolean;
  constructor() {
    this.connected = false;
    this.checkConnection();
    setInterval(async () => this.checkConnection(), 10000).unref(); // Check every 10 seconds
  }
  private async checkConnection() {
    try {
      await DatabaseReads.$queryRaw`SELECT 1`;
      this.connected = true;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError ||
        e instanceof Prisma.PrismaClientRustPanicError ||
        e instanceof Prisma.PrismaClientInitializationError
      ) {
        // As best as I can tell, the only types of PrismaClientKnownRequestError that
        // should be thrown by the above query would involve the database being unreachable.
        this.connected = false;
        console.log('Error checking database connection:', e);
        // ISSUE: #1128 this should probably be logged
      } else {
        throw e;
      }
    }
  }
  public IsConnected() {
    return this.connected;
  }
}

let conn: ConnectionChecker | null = null;

/** Main database is up */
export const DatabaseConnected = () => {
  if (!conn) {
    // If conn is not initialized, we create a new one
    // This is to ensure that the connection checker is only created once
    conn = new ConnectionChecker();
  }
  return conn.IsConnected();
};

export default prismaInternal;

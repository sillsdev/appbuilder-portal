import { Prisma, PrismaClient } from '@prisma/client';
import { ReadonlyClient } from './ReadonlyPrisma.js';

// This is the home of all database operations through prisma
// It is used from both the node-server package (which runs tasks) and from the sveltekit
// app itself. The goal is that prisma write operations should never be allowed directly
// from another package, but should instead utilize operator methods from here, which will
// handle "Form" verifications before performing writes. If implemented correctly, all
// these writes should be successful anyway, but we want to guarantee that at runtime.
// Therefore, we create a read-only version of the prisma client that can be passed out to
// other packages, but we keep the writable client behind the abstraction layer.
if (!process.env.VITE_DATABASE_URL)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore This is necessary for sveltekit, where import.meta.env will in fact exist
  process.env.VITE_DATABASE_URL = import.meta.env.VITE_DATABASE_URL;

const prisma = new PrismaClient();

export type PrismaClientExact = PrismaClient;

export const readonlyPrisma = prisma.$extends(ReadonlyClient);

class ConnectionChecker {
  private connected: boolean;
  constructor() {
    this.connected = false;
    setInterval(async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
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
          // ISSUE: #1128 this should probably be logged
        } else {
          throw e;
        }
      }
    }, 10000); // Check every 10 seconds
  }
  public IsConnected() {
    return this.connected;
  }
}

const conn = new ConnectionChecker();

/** Main database is up */
export const connected = () => conn.IsConnected();

export default prisma;

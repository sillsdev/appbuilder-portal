import { PrismaClient } from '@prisma/client';
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
  process.env.VITE_DATABASE_URL = import.meta.env.VITE_DATABASE_URL;
const prisma = new PrismaClient();

export type PrismaClientExact = PrismaClient;

export const readonlyPrisma = prisma.$extends(ReadonlyClient);

export default prisma;

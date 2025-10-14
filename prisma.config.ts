import { defineConfig } from '@prisma/config';
import path from 'path';
import 'dotenv/config';

export default defineConfig({
  schema: path.join('src', 'lib', 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join('src', 'lib', 'prisma', 'migrations'),
    seed: 'node --experimental-strip-types ./src/lib/prisma/seed.ts -o'
  }
});

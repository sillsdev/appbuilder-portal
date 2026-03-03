import type { Prisma } from '@prisma/client';

export const activeSystems = {
  OR: [
    {
      Default: true
    },
    {
      Organizations: { some: { UseDefaultBuildEngine: false } }
    }
  ]
} as const satisfies Prisma.SystemStatusesWhereInput;

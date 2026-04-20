import type { Prisma } from '@prisma/client';

export const activeSystems = {
  OR: [
    {
      OrganizationId: null
    },
    {
      Organization: { UseDefaultBuildEngine: false }
    }
  ]
} as const satisfies Prisma.SystemStatusesWhereInput;

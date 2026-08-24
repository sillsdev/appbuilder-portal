import type { Prisma } from '@prisma/client';
import { DatabaseReads } from '$lib/server/database';

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

export async function getDefaultBuildEngine() {
  return DatabaseReads.systemStatuses.findFirstOrThrow({
    where: { OrganizationId: null },
    select: {
      BuildEngineUrl: true,
      SystemVersions: { select: { ApplicationTypeId: true, Version: true } }
    }
  });
}

export async function mapSystems(
  organizations: Prisma.OrganizationsGetPayload<{
    select: {
      Id: true;
      UseDefaultBuildEngine: true;
      System: {
        select: { SystemVersions: { select: { ApplicationTypeId: true; Version: true } } };
      };
    };
  }>[]
) {
  const defaultSystem = await getDefaultBuildEngine();

  return new Map<number, Map<number, string>>(
    organizations.map((o) => [
      o.Id,
      new Map(
        (o.UseDefaultBuildEngine ? defaultSystem : (o.System ?? defaultSystem)).SystemVersions.map(
          (v) => [v.ApplicationTypeId, v.Version ?? '']
        )
      )
    ])
  );
}

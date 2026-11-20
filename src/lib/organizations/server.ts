import type { Prisma } from '@prisma/client';
import { RoleId } from '$lib/prisma';
import { DatabaseReads } from '$lib/server/database';

/** returns a Prisma filter for organizations that a user is admin for
 *
 * DOES NOT CHECK IF USER IS ADMIN OF SPECIFIC ORG (this needs to be checked externally with the security object)
 * @param sec Security object
 * @param orgId Id of specific organization
 */
export function filterAdminOrgs(sec: Security, orgId?: number) {
  return (
    orgId
      ? { Id: orgId }
      : sec.isSuperAdmin
        ? {} // returns empty object in case spreading is desired at call site
        : {
            UserRoles: {
              some: {
                RoleId: RoleId.OrgAdmin,
                UserId: sec.userId
              }
            }
          }
  ) satisfies Prisma.OrganizationsWhereInput;
}

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

import type { Prisma } from '@prisma/client';
import { RoleId } from '$lib/prisma';

/** Roles that grant access to an organization's support data */
const SUPPORT_DATA_ROLES = [RoleId.OrgAdmin, RoleId.SupportAgent];

function hasSupportDataRole(sec: Security) {
  return {
    some: {
      UserId: sec.userId,
      RoleId: { in: SUPPORT_DATA_ROLES }
    }
  };
}

/** returns a Prisma filter for the support data requests that a user can see
 *
 * DOES NOT CHECK IF USER HAS ACCESS TO A SPECIFIC ORG (this needs to be checked externally with the security object)
 * @param sec Security object
 * @param orgId Id of specific organization
 */
export function filterSupportData(sec: Security, orgId?: number) {
  return {
    OrganizationId: orgId,
    ...(sec.isSuperAdmin ? {} : { Organization: { UserRoles: hasSupportDataRole(sec) } })
  } satisfies Prisma.SupportDataWhereInput;
}

/** returns a Prisma filter for the organizations that a user can create or view support data for
 *
 * DOES NOT CHECK IF USER HAS ACCESS TO A SPECIFIC ORG (this needs to be checked externally with the security object)
 * @param sec Security object
 * @param orgId Id of specific organization
 */
export function filterSupportDataOrgs(sec: Security, orgId?: number) {
  return {
    Id: orgId,
    ...(sec.isSuperAdmin ? {} : { UserRoles: hasSupportDataRole(sec) })
  } satisfies Prisma.OrganizationsWhereInput;
}

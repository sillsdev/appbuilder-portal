import type { Prisma } from '@prisma/client';
import { error } from '@sveltejs/kit';
import { RoleId } from '$lib/prisma';
import { getSiteParam } from '$lib/site-params/server';

/** The orgs that have the support data feature enabled (same allow-list as the Support Agent role) */
export function getSupportDataAllowList() {
  return getSiteParam('users', 'org-show-support-agent');
}

/** Throws a 403 if support data is not enabled for the org (or, with no org, for any org the user belongs to).
 *
 * Super admins are exempt.
 * @param sec Security object
 * @param orgId Id of specific organization
 */
export async function requireSupportDataEnabled(sec: Security, orgId?: number) {
  if (sec.isSuperAdmin) return;
  const allowlist = await getSupportDataAllowList();
  if (allowlist === 'all') return;
  const enabled =
    orgId !== undefined
      ? allowlist.includes(orgId)
      : sec.organizationMemberships.some((id) => allowlist.includes(id));
  if (!enabled) error(403, 'Support data is not enabled for this organization');
}

/** returns a Prisma filter for the support data requests that a user can see
 *
 * DOES NOT CHECK IF USER HAS ACCESS TO A SPECIFIC ORG (this needs to be checked externally with the security object)
 * @param sec Security object
 * @param orgId Id of specific organization
 * @param allowlist orgs with support data enabled; non-super-admins only see requests from these orgs
 */
export function filterSupportData(
  sec: Security,
  orgId?: number,
  allowlist: number[] | 'all' = 'all'
) {
  return {
    OrganizationId: orgId,
    ...(sec.isSuperAdmin
      ? {}
      : {
          Organization: {
            ...(allowlist !== 'all' ? { Id: { in: allowlist } } : {}),
            UserRoles: {
              some: {
                UserId: sec.userId,
                RoleId: { in: [RoleId.OrgAdmin, RoleId.SupportAgent] }
              }
            }
          }
        })
  } satisfies Prisma.SupportDataWhereInput;
}

/** returns a Prisma filter for the organizations that a user can create or view support data for
 *
 * DOES NOT CHECK IF USER HAS ACCESS TO A SPECIFIC ORG (this needs to be checked externally with the security object)
 * @param sec Security object
 * @param allowlist orgs with support data enabled; only these orgs are included (for everyone, including super admins)
 * @param orgId Id of specific organization
 */
export function filterSupportDataOrgs(sec: Security, allowlist: number[] | 'all', orgId?: number) {
  return {
    Id: orgId ?? (allowlist !== 'all' ? { in: allowlist } : undefined),
    ...(sec.isSuperAdmin
      ? {}
      : {
          UserRoles: {
            some: {
              UserId: sec.userId,
              RoleId: { in: [RoleId.OrgAdmin, RoleId.SupportAgent] }
            }
          }
        })
  } satisfies Prisma.OrganizationsWhereInput;
}

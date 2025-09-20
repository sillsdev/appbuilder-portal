import type { Session } from '@auth/sveltekit';
import { RoleId } from '$lib/prisma';

type RolesMap = Session['user']['roles'];

/** returns true if user is a SuperAdmin, or is an OrgAdmin for the specified organization
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdminForOrg(orgId: number, roles: RolesMap): boolean {
  const orgRoles = roles.get(orgId);
  return !!orgRoles && (orgRoles.includes(RoleId.SuperAdmin) || orgRoles.includes(RoleId.OrgAdmin));
}
/** returns a list of organizations where the user has the specified role
 *
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function orgsForRole(role: RoleId, roles: RolesMap): number[] {
  return [
    ...roles
      .entries()
      .filter(([, r]) => r.includes(role))
      .map(([orgId]) => orgId)
  ];
}
/** returns true if user is a SuperAdmin, or is an OrgAdmin for any organization
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdminForAny(roles: RolesMap): boolean {
  return roles.values().some((r) => r.includes(RoleId.SuperAdmin) || r.includes(RoleId.OrgAdmin));
}
/** returns true if user is a SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function isSuperAdmin(roles: RolesMap): boolean {
  return roles.values().some((r) => r.includes(RoleId.SuperAdmin));
}

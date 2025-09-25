import type { Session } from '@auth/sveltekit';
import { RoleId } from '$lib/prisma';

type ClientRolesArray = Session['user']['roles'];

/** returns true if user is a SuperAdmin, or is an OrgAdmin for the specified organization
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdminForOrg(orgId: number, roles: ClientRolesArray): boolean {
  const orgRoles = roles.filter(([oId]) => oId === orgId).map(([, r]) => r);
  return !!orgRoles && (orgRoles.includes(RoleId.SuperAdmin) || orgRoles.includes(RoleId.OrgAdmin));
}
/** returns a list of organizations where the user has the specified role
 *
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function orgsForRole(role: RoleId, roles: ClientRolesArray): number[] {
  return roles.filter(([, r]) => r === role).map(([orgId]) => orgId);
}
/** returns true if user is a SuperAdmin, or is an OrgAdmin for any organization
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdminForAny(roles: ClientRolesArray): boolean {
  return roles.some(([_, r]) => r === RoleId.SuperAdmin || r === RoleId.OrgAdmin);
}
/** returns true if user is a SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function isSuperAdmin(roles: ClientRolesArray): boolean {
  return roles.some(([, r]) => r === RoleId.SuperAdmin);
}

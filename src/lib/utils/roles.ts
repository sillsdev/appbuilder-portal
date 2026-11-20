import type { Session } from '@auth/sveltekit';
import { RoleId } from '$lib/prisma';

type ClientRolesArray = Session['user']['roles'];

/** returns true if a user has the specified role for the organization
 *
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function hasRoleForOrg(orgId: number, role: RoleId, roles: ClientRolesArray): boolean {
  return roles.some(
    ([assignedOrgId, assignedRole]) => assignedOrgId === orgId && assignedRole === role
  );
}

/** returns true if user is a SuperAdmin, or is an OrgAdmin for the specified organization
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdminForOrg(orgId: number, roles: ClientRolesArray): boolean {
  return isSuperAdmin(roles) || hasRoleForOrg(orgId, RoleId.OrgAdmin, roles);
}
/** returns a list of organizations where the user has the specified role
 *
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function orgsForRole(role: RoleId, roles: ClientRolesArray): number[] {
  return roles.filter(([, r]) => r === role).map(([orgId]) => orgId);
}
/** returns true if a user has the specified role for any organization
 *
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function hasRoleForAny(role: RoleId, roles: ClientRolesArray): boolean {
  return roles.some(([, r]) => r === role);
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

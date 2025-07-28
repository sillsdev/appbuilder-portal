import type { Session } from '@auth/sveltekit';
import { RoleId } from '$lib/prisma';

type RolesMap = Session['user']['roles'];

/** returns true if user is a SuperAdmin, or is an OrgAdmin for the specified organization
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdminForOrg(orgId: number, roles?: RolesMap): boolean {
  return !!roles?.find(
    ([org, role]) => role === RoleId.SuperAdmin || (role === RoleId.OrgAdmin && org === orgId)
  );
}
/** returns true if user is a SuperAdmin, or is an OrgAdmin for any of the provided orgs
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdminForOrgs(orgs: number[], roles?: RolesMap): boolean {
  return !!roles?.find(
    ([org, role]) => role === RoleId.SuperAdmin || (role === RoleId.OrgAdmin && orgs.includes(org))
  );
}
/** returns true if user is a SuperAdmin, or is an OrgAdmin for any organization
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdmin(roles?: RolesMap): boolean {
  return !!roles?.find(([_, role]) => role === RoleId.SuperAdmin || role === RoleId.OrgAdmin);
}
/** returns true if user is a SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function isSuperAdmin(roles?: RolesMap): boolean {
  return !!roles?.find(([_, role]) => role === RoleId.SuperAdmin);
}
/** returns true if user has specified role in specified org
 *
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function hasRoleForOrg(role: RoleId, orgId: number, roles?: RolesMap): boolean {
  return !!roles?.find(([org, roleId]) => roleId === role && org === orgId);
}
/** returns a list of organizations where the user has the specified role
 *
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function orgsForRole(role: RoleId, roles?: RolesMap): number[] {
  return roles?.filter(([_, roleId]) => roleId === role).map(([org, _]) => org) ?? [];
}

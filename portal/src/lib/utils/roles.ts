import { RoleId } from "sil.appbuilder.portal.common/prisma";

/** returns true if user is a SuperAdmin, or is an OrgAdmin for the specified organization
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdminForOrg(orgId: number, roles?: [number, number][]): boolean {
  return !!roles?.find(
    ([org, role]) => role === RoleId.SuperAdmin || (role === RoleId.OrgAdmin && org === orgId)
  );
}
/** returns true if user is a SuperAdmin, or is an OrgAdmin for any of the provided orgs
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdminForOrgs(orgs: number[], roles?: [number, number][]): boolean {
  return !!roles?.find(
    ([org, role]) => role === RoleId.SuperAdmin || (role === RoleId.OrgAdmin && orgs.includes(org))
  );
}
/** returns true if user is a SuperAdmin, or is an OrgAdmin for any organization
 * @param roles [OrganizationId, RoleId][]
 */
export function isAdmin(roles?: [number, number][]): boolean {
  return !!roles?.find((r) => r[1] === RoleId.SuperAdmin || r[1] === RoleId.OrgAdmin);
}
/** returns true if user is a SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function isSuperAdmin(roles?: [number, number][]): boolean {
  return !!roles?.find((r) => r[1] === RoleId.SuperAdmin);
}
/** returns true if user has specified role in specified org
 * 
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [OrganizationId, RoleId][]
 */
export function hasRoleForOrg(role: RoleId, orgId: number, roles?: [number, number][]): boolean {
  return !!roles?.find((r) => r[1] === role && r[0] === orgId);
}
/** returns a list of organizations where the user has the specified role 
 * 
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [OrganizationId, RoleId][]
*/
export function orgsForRole(role: RoleId, roles?: [number, number][]): number[] {
  return roles?.filter((r) => r[1] === role).map((r) => r[0]) ?? [];
}
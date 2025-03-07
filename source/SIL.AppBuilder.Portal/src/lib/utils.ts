import { RoleId } from 'sil.appbuilder.portal.common/prisma';

export function bytesToHumanSize(bytes: bigint | null) {
  if (bytes === null) {
    return '--';
  }
  const base = BigInt('1024');
  if (bytes > base ** BigInt(3)) {
    return bytes / base ** BigInt(3) + ' GB';
  } else if (bytes > base * base) {
    return bytes / (base * base) + ' MB';
  } else if (bytes > base) {
    return bytes / base + ' KB';
  } else {
    return bytes + ' bytes';
  }
}

interface NamedEntity {
  Name: string | null;
}

export function sortByName(a: NamedEntity, b: NamedEntity, languageTag: string): number {
  return a.Name?.localeCompare(b.Name ?? '', languageTag) ?? 0;
}

/** returns true if user is a SuperAdmin, or is an OrgAdmin for the specified organization
 * @param roles [RoleId, OrganizationId][]
 */
export function isAdminForOrg(orgId: number, roles?: [number, number][]): boolean {
  return !!roles?.find(
    (r) => r[0] === RoleId.SuperAdmin || (r[0] === RoleId.OrgAdmin && r[1] === orgId)
  );
}
/** returns true if user is a SuperAdmin, or is an OrgAdmin for any of the provided orgs
 * @param roles [RoleId, OrganizationId][]
 */
export function isAdminForOrgs(orgs: number[], roles?: [number, number][]): boolean {
  return !!roles?.find(
    (r) => r[0] === RoleId.SuperAdmin || (r[0] === RoleId.OrgAdmin && orgs.includes(r[1]))
  );
}
/** returns true if user is a SuperAdmin, or is an OrgAdmin for any organization
 * @param roles [RoleId, OrganizationId][]
 */
export function isAdmin(roles?: [number, number][]): boolean {
  return !!roles?.find((r) => r[0] === RoleId.SuperAdmin || r[0] === RoleId.OrgAdmin);
}
/** returns true if user is a SuperAdmin
 * @param roles [RoleId, OrganizationId][]
 */
export function isSuperAdmin(roles?: [number, number][]): boolean {
  return !!roles?.find((r) => r[0] === RoleId.SuperAdmin);
}
/** returns true if user has specified role in specified org
 * 
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [RoleId, OrganizationId][]
 */
export function hasRoleForOrg(role: RoleId, orgId: number, roles?: [number, number][]): boolean {
  return !!roles?.find((r) => r[0] === role && r[1] === orgId);
}
/** returns a list of organizations where the user has the specified role 
 * 
 * IS NOT SHORT-CIRCUITED by SuperAdmin
 * @param roles [RoleId, OrganizationId][]
*/
export function orgsForRole(role: RoleId, roles?: [number, number][]): number[] {
  return roles?.filter((r) => r[0] === role).map((r) => r[1]) ?? [];
}

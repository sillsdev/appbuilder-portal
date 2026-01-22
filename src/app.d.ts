// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// Security class type because this file cannot import anything
declare global {
  interface SecurityLike {
    userId: number;
    roles: Map<number, number[]>;
  }
  class Security implements SecurityLike {
    public readonly isSuperAdmin: boolean;
    public readonly userId: number;
    public readonly organizationMemberships: number[];
    public readonly roles: Map<number, number[]>;
    public readonly sessionForm: Session['user'];
    requireApiToken(): void | never;
    requireAuthenticated(): void | never;
    requireSuperAdmin(): this | never;
    requireAdminOfOrg(organizationId: number): this | never;
    requireAdminOfOrgIn(organizationIds: number[]): this | never;
    requireAdminOfAny(): this | never;
    requireHasRole(organizationId: number, roleId: number, orOrgAdmin?: boolean): this | never;
    requireMemberOfOrg(organizationId: number): this | never;
    requireMemberOfOrgOrSuperAdmin(organizationId: number): this | never;
    requireProjectWriteAccess(
      project?: { OwnerId: number; OrganizationId: number } | null
    ): this | never;
    requireProjectReadAccess(
      userGroups: { /* Group.Id */ Id: number }[],
      project: {
        OwnerId: number;
        OrganizationId: number;
        GroupId: number;
      } | null
    ): this | never;
    requireProjectClaimable(
      userGroups: { /* Group.Id */ Id: number }[],
      project?: {
        OwnerId: number;
        OrganizationId: number;
        GroupId: number;
      },
      // leave blank to use security userId
      userId?: number
    ): this | never;
    requireMemberOfAnyOrg(): this | never;
    requireNothing(): this | never;
  }
  namespace App {
    // interface Error {}
    interface Locals {
      // This typing doesn't work, but we never use it
      paraglide: ParaglideLocals<AvailableLanguageTag>;
      security: Security;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};

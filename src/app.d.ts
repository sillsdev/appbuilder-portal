// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

// Security class type because this file cannot import anything
declare global {
  class Security {
    public readonly isSuperAdmin: boolean;
    public readonly userId: number;
    public readonly organizationMemberships: number[];
    public readonly roles: Map<number, number[]>;
    requireAuthenticated(): void | never;
    requireSuperAdmin(): this | never;
    requireAdminForOrg(organizationId: number): this | never;
    requireAdminForOrgIn(organizationIds: number[]): this | never;
    requireAdminOfAny(): this | never;
    requireHasRole(organizationId: number, roleId: number): this | never;
    requireMemberOfOrg(organizationId: number): this | never;
    requireMemberOfOrgOrSuperAdmin(organizationId: number): this | never;
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

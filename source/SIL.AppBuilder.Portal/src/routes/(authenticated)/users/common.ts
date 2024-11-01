type UserInfo = {
  Id: number;
  Name: string | null;
  Email: string | null;
  UserRoles: { OrganizationId: number; RoleId: number }[];
  GroupMemberships: { Group: { Id: number; OwnerId: number } }[];
  OrganizationMemberships: {
    OrganizationId: number;
  }[];
  IsLocked: boolean;
};

// or by using smaller (or even minified) keys (eg N instead of Name, O instead of Organizations)
// Done - Aidan
export function minifyUser(user: UserInfo) {
  return {
    /** User Id */
    I: user.Id,
    /** User Name */
    N: user.Name,
    /** User Email */
    E: user.Email,
    /** User OrganizationMemberships */
    O: user.OrganizationMemberships.map((orgMem) => ({
      /** Roles */
      R: user.UserRoles.filter((ur) => ur.OrganizationId === orgMem.OrganizationId).map(
        (r) => r.RoleId
      ),
      /** Organization Id */
      I: orgMem.OrganizationId,
      /** Group Ids */
      G: user.GroupMemberships.filter(
        (groupMem) => groupMem.Group.OwnerId === orgMem.OrganizationId
      ).map((group) => group.Group.Id)
    })),
    /** User IsLocked */
    A: !user.IsLocked
  };
}

export type MinifiedUser = ReturnType<typeof minifyUser>;
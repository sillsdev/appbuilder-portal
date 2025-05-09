import type { Prisma } from '@prisma/client';

type UserInfo = Prisma.UsersGetPayload<{
  select: {
    Id: true;
    Name: true;
    Email: true;
    UserRoles: { select: { OrganizationId: true; RoleId: true } };
    GroupMemberships: { select: { Group: { select: { Id: true; OwnerId: true } } } };
    OrganizationMemberships: {
      select: {
        OrganizationId: true;
      };
    };
    IsLocked: true;
  };
}>;

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
    /** User is Active (i.e. !IsLocked) */
    A: !user.IsLocked
  };
}

export type MinifiedUser = ReturnType<typeof minifyUser>;

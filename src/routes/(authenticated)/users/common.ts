import type { Prisma } from '@prisma/client';

type UserInfo = Prisma.UsersGetPayload<{
  select: {
    Id: true;
    Name: true;
    Email: true;
    UserRoles: { select: { OrganizationId: true; RoleId: true } };
    Groups: { select: { Id: true; OwnerId: true } };
    Organizations: {
      select: {
        Id: true;
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
    O: user.Organizations.map((org) => ({
      /** Roles */
      R: user.UserRoles.filter((ur) => ur.OrganizationId === org.Id).map((r) => r.RoleId),
      /** Organization Id */
      I: org.Id,
      /** Group Ids */
      G: user.Groups.filter((group) => group.OwnerId === org.Id).map((group) => group.Id)
    })),
    /** User is Active (i.e. !IsLocked) */
    A: !user.IsLocked
  };
}

export type MinifiedUser = ReturnType<typeof minifyUser>;

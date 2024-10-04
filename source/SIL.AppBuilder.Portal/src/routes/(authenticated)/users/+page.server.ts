import { error, redirect } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import type { Actions, PageServerLoad } from './$types';

// Not used, just for reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserInfo = {
  Id: number;
  Name: string;
  FamilyName: string;
  Organizations: {
    Roles: number[];
    Name: string;
    Groups: string[];
  }[];
  IsLocked: boolean;
};

export const load = (async (event) => {
  const userInfo = (await event.locals.auth())?.user;
  const userId = userInfo?.userId;
  if (!userId) return redirect(302, '/');

  // If we are a superadmin, collect all users, otherwise
  // collect every user in one of our organizations and deduplicate them
  const include = {
    UserRoles: {
      include: {
        Organization: true
      }
    },
    GroupMemberships: {
      include: {
        Group: true
      }
    },
    OrganizationMemberships: {
      include: {
        Organization: true
      }
    }
  };

  // Sacrificing perfect type safety for readibility
  let users;
  let organizations;

  if (userInfo.roles.find((r) => r[1] === RoleId.SuperAdmin)) {
    // Get all users that are locked or are a member of at least one organization
    // (Users that are not in an organization and are not locked are not interesting
    // because they can't login and behave essentially as locked users or as users
    // who have never logged in before)
    users = await prisma.users.findMany({
      include,
      where: {
        OR: [
          {
            OrganizationMemberships: {
              some: {}
            }
          },
          {
            IsLocked: true
          }
        ]
      }
    });
    organizations = await prisma.organizations.findMany({});
  } else {
    // For each OrganizationMembership of the current user where they are an organization admin, include all
    // users of that Organization. This creates duplicates for users that are in multiple of the same
    // organizations as the current user so we put them in a map by user id to prune duplicates. There may
    // be a better way to handle this with prisma itself

    // Initially this gives a structure of
    /**
     * user: {
     *  OrganizationMemberships: [{
     *    Organization: {
     *      OrganizationMemberships: [{
     *        User: {}
     *      }]
     *    }
     *  }]
     * }
     */
    // so we flatMap it into an array of all of the OrganizationMemberships Users, and pass it to the Map indexed by user.Id
    // finally, filter the organizations we return by the organizations the current user is an organizational admin for

    users = [
      ...[
        ...new Map(
          (await prisma.users.findUnique({
            where: {
              Id: userId
            },
            include: {
              OrganizationMemberships: {
                where: {
                  Organization: {
                    UserRoles: {
                      some: {
                        RoleId: RoleId.OrgAdmin,
                        UserId: userId
                      }
                    }
                  }
                },
                include: {
                  Organization: {
                    include: {
                      OrganizationMemberships: {
                        include: {
                          User: {
                            include
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }))!.OrganizationMemberships.flatMap((org) =>
            org.Organization.OrganizationMemberships.flatMap((orgMem) => orgMem.User)
          ).map((user) => [user.Id, user])
        ).values()
      ]
    ];
    organizations = await prisma.organizations.findMany({
      where: {
        UserRoles: {
          some: {
            RoleId: RoleId.OrgAdmin,
            UserId: userId
          }
        }
      },
      include: {
        UserRoles: true
      }
    });
    const currentUserOrgAdmins = new Set(organizations.map((org) => org.Id));
    users.forEach((user) => {
      user.OrganizationMemberships = user.OrganizationMemberships.filter((mem) => {
        return currentUserOrgAdmins.has(mem.OrganizationId);
      });
      user.GroupMemberships = user.GroupMemberships.filter((mem) => {
        return currentUserOrgAdmins.has(mem.Group.OwnerId);
      });
    });
  }
  return {
    // Only pass essential information to the client.
    // About 120 bytes per small user (with one organization and one group), and 240 for a larger user in several organizations.
    // On average about 175 bytes per user. If PROD has 200 active users, that's 35 KB of data to send all of them. 620 total users = 110 KB
    // The whole page is about 670 KB without this data.
    // Only superadmins would see this larger size, most users have organizations with much fewer users where it does not matter

    // Could be improved by putting group names into a referenced palette
    // (minimal returns if most users are in different organizations and groups)
    // or by using smaller (or even minified) keys (eg N instead of Name, O instead of Organizations)

    // More significantly, could paginate results to around 50 users/page = 10 KB
    users: users.map((user) => ({
      Id: user.Id,
      Name: user.Name!,
      FamilyName: user.FamilyName!,
      Email: user.Email,
      Organizations: user.OrganizationMemberships.map((org) => ({
        Roles: user.UserRoles.filter((r) => r.OrganizationId === org.OrganizationId).map(
          (r) => r.RoleId
        ),
        Id: org.OrganizationId,
        Groups: user.GroupMemberships.filter(
          (group) => group.Group.OwnerId === org.OrganizationId
        ).map((group) => group.Group.Name!)
      })),
      IsLocked: user.IsLocked
    })),
    organizations: organizations?.map((org) => ({
      Name: org.Name,
      Id: org.Id
    }))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  async lock(event) {
    const form = await event.request.formData();
    const userId = parseInt(form.get('id') + '');
    const enabled = form.get('enabled');
    if (isNaN(userId)) return error(400);
    await DatabaseWrites.users.update({
      where: {
        Id: userId
      },
      data: {
        IsLocked: !enabled
      }
    });
    return { success: true };
  }
};

import prisma, { isUserSuperAdmin } from '$lib/prisma';
import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

// Not used, just for reference
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type UserInfo = {
  Id: number;
  Name: string;
  Organizations: {
    Roles: number[];
    Name: string;
    Groups: string[];
  }[];
  IsLocked: boolean;
};

export const load = (async (event) => {
  const userId = (await event.locals.auth())?.user.userId;
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

  if (await isUserSuperAdmin(userId)) {
    users = await prisma.users.findMany({
      include
    });
  } else {
    users = [
      ...new Map(
        (await prisma.users.findUnique({
          where: {
            Id: userId
          },
          include: {
            OrganizationMemberships: {
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
        ).map((a) => [a.Id, a])
      ).values()
    ];
  }
  return {
    // Only pass essential information to the client.
    // About 120 bytes per small user (with one organization and one group), and 240 for a larger user in several organizations.
    // On average about 175 bytes per user. If PROD has 200 active users, that's 35 KB of data to send all of them. 620 total users = 110 KB
    // The whole page is about 670 KB without this data.

    // Could be improved by putting group and organization names into a referenced palette
    // (minimal returns if most users are in different organizations and groups)
    // or by using smaller (or even minified) keys (eg N instead of Name, O instead of Organizations)

    // More significantly, could paginate results to around 50 users/page = 10 KB
    users: users.map((user) => ({
      Id: user.Id,
      Name: user.Name!,
      Organizations: user.OrganizationMemberships.map((org) => ({
        Roles: user.UserRoles.filter((r) => r.OrganizationId === org.OrganizationId).map(
          (r) => r.RoleId
        ),
        Name: org.Organization.Name!,
        Groups: user.GroupMemberships.filter(
          (group) => group.Group.OwnerId === org.OrganizationId
        ).map((group) => group.Group.Name!)
      })),
      IsLocked: user.IsLocked
    }))
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  async lock(event) {
    const form = await event.request.formData();
    console.log(form);
    const userId = parseInt(form.get('id') + '');
    const enabled = form.get('enabled');
    if (isNaN(userId)) return error(400);
    await prisma.users.update({
      where: {
        Id: userId
      },
      data: {
        IsLocked: !enabled
      }
    });
    console.log('Done', userId, enabled);
    return { success: true };
  }
};

import { error, redirect } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import type { Prisma } from '@prisma/client';
import type { Actions, PageServerLoad } from './$types';
import * as v from 'valibot';
import { idSchema } from '$lib/valibot';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { paginateSchema } from '$lib/table';
import { minifyUser } from './common';

const lockSchema = v.object({
  user: idSchema,
  active: v.boolean()
});

const userSchema = v.object({
  page: paginateSchema,
  search: v.string(),
  organizationId: v.nullable(idSchema)
});

function select(orgIds?: number[]) {
  return {
    Id: true,
    Name: true,
    Email: true,
    IsLocked: true,
    UserRoles: {
      where: orgIds ? { OrganizationId: { in: orgIds } } : undefined,
      select: {
        RoleId: true,
        OrganizationId: true
      }
    },
    GroupMemberships: {
      where: orgIds ? { Group: { OwnerId: { in: orgIds } } } : undefined,
      select: {
        Group: {
          select: { Id: true, OwnerId: true }
        }
      }
    },
    OrganizationMemberships: {
      where: orgIds ? { OrganizationId: { in: orgIds } } : undefined,
      select: {
        OrganizationId: true
      }
    }
  };
}

// If we are a superadmin, collect all users, otherwise
// collect every user in one of our organizations
function adminOrDefaultWhere(isSuper: boolean, orgIds: number[]) {
  return isSuper
    ? {
        // Get all users that are locked or are a member of at least one organization
        // (Users that are not in an organization and are not locked are not interesting
        // because they can't login and behave essentially as locked users or as users
        // who have never logged in before)
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
    : {
        OrganizationMemberships: {
          some: {
            OrganizationId: { in: orgIds }
          }
        }
      };
}

export const load = (async (event) => {
  const userInfo = (await event.locals.auth())?.user;
  const userId = userInfo?.userId;
  if (!userId) return redirect(302, '/');

  const isSuper = !!userInfo.roles.find((r) => r[1] === RoleId.SuperAdmin);

  const organizations = await prisma.organizations.findMany({
    where: isSuper
      ? undefined
      : {
          UserRoles: {
            some: {
              RoleId: RoleId.OrgAdmin,
              UserId: userId
            }
          }
        },
    select: {
      Id: true,
      Name: true,
      UserRoles: true
    }
  });

  const orgIds = organizations.map((o) => o.Id);

  const users = await prisma.users.findMany({
    orderBy: {
      FamilyName: 'asc'
    },
    select: select(isSuper ? undefined : orgIds),
    where: adminOrDefaultWhere(isSuper, orgIds),
    // More significantly, could paginate results to around 50 users/page = 10 KB
    // Done - Aidan
    take: 50
  });

  return {
    // Only pass essential information to the client.
    // About 120 bytes per small user (with one organization and one group), and 240 for a larger user in several organizations.
    // On average about 175 bytes per user. If PROD has 200 active users, that's 35 KB of data to send all of them. 620 total users = 110 KB
    // The whole page is about 670 KB without this data.
    // Only superadmins would see this larger size, most users have organizations with much fewer users where it does not matter

    users: users.map(minifyUser),
    userCount: users.length,
    // Could be improved by putting group names into a referenced palette
    // (minimal returns if most users are in different organizations and groups)
    // I went ahead and did this too. My assumption is that there will generally be multiple users in each organization and group, so I think this should be a justifiable change. - Aidan
    groups: Object.fromEntries(
      (
        await prisma.groups.findMany({
          where: {
            OwnerId: { in: orgIds },
            GroupMemberships: {
              some: {}
            }
          }
        })
      ).map((g) => [g.Id, g.Name])
    ),
    organizations: Object.fromEntries(organizations?.map((org) => [org.Id, org.Name])),
    organizationCount: organizations.length,
    form: await superValidate(
      {
        organizationId: organizations.length > 1 ? null : organizations[0].Id,
        page: {
          page: 0,
          size: 50
        }
      },
      valibot(userSchema)
    )
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  async lock(event) {
    const session = await event.locals.auth();
    if (!session) return error(403);
    const form = await superValidate(event, valibot(lockSchema));
    if (!form.valid || session.user.userId === form.data.user) return { form, ok: false };
    await DatabaseWrites.users.update({
      where: {
        Id: form.data.user
      },
      data: {
        // TODO: Are we actually doing anything meaningful with this?
        IsLocked: !form.data.active
      }
    });
    return { form, ok: true };
  },

  async page(event) {
    const session = await event.locals.auth();
    if (!session) return error(403);
    const form = await superValidate(event, valibot(userSchema));
    if (!form.valid) return { form, ok: false };

    const isSuper = !!session.user.roles.find((r) => r[1] === RoleId.SuperAdmin);

    const organizations = await prisma.organizations.findMany({
      where:
        form.data.organizationId !== null
          ? { Id: form.data.organizationId }
          : isSuper
          ? undefined
          : {
              UserRoles: {
                some: {
                  RoleId: RoleId.OrgAdmin,
                  UserId: session.user.userId
                }
              }
            },
      select: {
        Id: true,
        Name: true,
        UserRoles: true
      }
    });

    const orgIds = organizations.map((o) => o.Id);

    const where: Prisma.UsersWhereInput = {
      AND: [
        adminOrDefaultWhere(isSuper, orgIds),
        {
          OR: form.data.search
            ? [
                {
                  Name: {
                    contains: form.data.search,
                    mode: 'insensitive'
                  }
                },
                {
                  Email: {
                    contains: form.data.search,
                    mode: 'insensitive'
                  }
                }
              ]
            : undefined
        }
      ]
    };

    const users = await prisma.users.findMany({
      orderBy: {
        FamilyName: 'asc'
      },
      select: select(isSuper ? undefined : orgIds),
      where: where,
      // More significantly, could paginate results to around 50 users/page = 10 KB
      // Done - Aidan
      skip: form.data.page.page * form.data.page.size,
      take: form.data.page.size
    });

    return {
      form,
      ok: true,
      query: { data: users.map(minifyUser), count: await prisma.users.count({ where: where }) }
    };
  }
};

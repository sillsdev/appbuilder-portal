import { trace } from '@opentelemetry/api';
import type { Prisma } from '@prisma/client';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { minifyUser } from '../../common';
import type { Actions, PageServerLoad } from './$types';
import { RoleId } from '$lib/prisma';
import { QueueConnected } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { idSchema, paginateSchema } from '$lib/valibot';

const lockSchema = v.object({
  user: idSchema,
  active: v.boolean()
});

const tracer = trace.getTracer('/users');

const searchFilterSchema = v.object({
  page: paginateSchema,
  search: v.string()
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
function userFilter(isSuper: boolean, orgIds: number[]) {
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

function orgFilter(sec: Security): Prisma.OrganizationsWhereInput | undefined {
  return sec.isSuperAdmin
    ? undefined
    : {
        UserRoles: {
          some: {
            RoleId: RoleId.OrgAdmin,
            UserId: sec.userId
          }
        }
      };
}

export const load = (async ({ locals, params }) => {
  locals.security.requireAdminOfAny();
  if (params.orgId) {
    locals.security.requireAdminOfOrg(Number(params.orgId));
  }
  return await tracer.startActiveSpan('load', async (span) => {
    try {
      const isSuper = locals.security.isSuperAdmin;
      const organizations = await DatabaseReads.organizations.findMany({
        where: orgFilter(locals.security),
        select: {
          Id: true,
          Name: true
        }
      });

      // this filters for OrgAdmin, using the Security object does not
      const orgIds = organizations.map((o) => o.Id);

      const users = await DatabaseReads.users.findMany({
        orderBy: {
          Name: 'asc'
        },
        select: select(isSuper ? undefined : orgIds),
        where: userFilter(isSuper, orgIds),
        take: 50
      });

      span.setAttributes({
        'auth.load.userId': locals.security.userId!,
        'auth.load.user.roles': JSON.stringify(Array.from(locals.security.roles.entries())),
        'auth.load.user.isSuper': isSuper,
        'auth.load.user.orgIds': JSON.stringify(orgIds)
      });
      span.addEvent('loaded user list', {
        'auth.load.userCount': users.length
      });

      return {
        // Only pass essential information to the client.
        // About 120 bytes per small user (with one organization and one group), and 240 for a larger user in several organizations.
        // On average about 175 bytes per user. If PROD has 200 active users, that's 35 KB of data to send all of them. 620 total users = 110 KB
        // The whole page is about 670 KB without this data.
        // Only superadmins would see this larger size, most users have organizations with much fewer users where it does not matter

        users: users.map(minifyUser),
        userCount: users.length,
        organizations,
        groups: await DatabaseReads.groups.findMany({
          where: {
            OwnerId: locals.security.isSuperAdmin ? undefined : { in: orgIds },
            GroupMemberships: {
              some: {}
            }
          }
        }),
        form: await superValidate(
          {
            page: {
              page: 0,
              size: 50
            }
          },
          valibot(searchFilterSchema)
        ),
        jobsAvailable: QueueConnected()
      };
    } finally {
      span.end();
    }
  });
}) satisfies PageServerLoad;

export const actions: Actions = {
  async lock(event) {
    event.locals.security.requireAdminOfAny();
    if (event.params.orgId) {
      event.locals.security.requireAdminOfOrg(Number(event.params.orgId));
    }
    const form = await superValidate(event, valibot(lockSchema));
    if (!form.valid || event.locals.security.userId === form.data.user) return { form, ok: false };
    event.locals.security.requireAdminOfOrgIn(
      (
        await DatabaseReads.organizationMemberships.findMany({
          where: { UserId: form.data.user },
          distinct: 'OrganizationId'
        })
      ).map(({ OrganizationId }) => OrganizationId)
    );
    await DatabaseWrites.users.update({
      where: {
        Id: form.data.user
      },
      data: {
        IsLocked: !form.data.active
      }
    });
    return { form, ok: true };
  },

  async page(event) {
    event.locals.security.requireAdminOfAny();
    if (event.params.orgId) {
      event.locals.security.requireAdminOfOrg(Number(event.params.orgId));
    }
    const form = await superValidate(event, valibot(searchFilterSchema));
    if (!form.valid) return { form, ok: false };

    const orgId = event.params.orgId ? Number(event.params.orgId) : undefined;

    return await tracer.startActiveSpan('page action', async (span) => {
      const isSuper = event.locals.security.isSuperAdmin;

      const organizations = await DatabaseReads.organizations.findMany({
        where: orgId ? { Id: orgId } : orgFilter(event.locals.security),
        select: {
          Id: true
        }
      });

      const orgIds = organizations.map((o) => o.Id);

      span.setAttributes({
        'auth.load.userId': event.locals.security.userId,
        'auth.load.user.roles': JSON.stringify(event.locals.security.roles),
        'auth.load.user.isSuper': isSuper,
        'auth.load.user.orgIds': JSON.stringify(orgIds)
      });

      const where: Prisma.UsersWhereInput = {
        AND: [
          orgId
            ? { OrganizationMemberships: { some: { OrganizationId: orgId } } }
            : userFilter(isSuper, orgIds),
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

      const users = await DatabaseReads.users.findMany({
        orderBy: {
          Name: 'asc'
        },
        select: select(isSuper ? undefined : orgIds),
        where: where,
        skip: form.data.page.page * form.data.page.size,
        take: form.data.page.size
      });

      span.addEvent('loaded user list', {
        'auth.load.userCount': users.length
      });

      return {
        form,
        ok: true,
        query: {
          data: users.map(minifyUser),
          count: await DatabaseReads.users.count({ where: where })
        }
      };
    });
  }
};

import type { Prisma } from '@prisma/client';
import { type Actions, error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { PageServerLoad } from './$types';
import { RoleId } from '$lib/prisma';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { bulkProjectActionSchema, projectSearchSchema, pruneProjects } from '$lib/projects';
import { doProjectAction, projectFilter } from '$lib/projects/server';
import { QueueConnected } from '$lib/server/bullmq/queues';
import { DatabaseReads } from '$lib/server/database';
import { stringIdSchema } from '$lib/valibot';

const bulkProductActionSchema = v.object({
  products: v.array(stringIdSchema),
  operation: v.nullable(v.pipe(v.enum(ProductActionType), v.excludes(ProductActionType.Cancel)))
});

function whereStatements(
  paramFilter: string,
  user: Security,
  orgIds?: number[]
): Prisma.ProjectsWhereInput {
  if (user.isSuperAdmin) {
    return filter(paramFilter, orgIds, user.userId);
  } else {
    return {
      OR: [
        {
          Organization: {
            UserRoles: {
              some: {
                UserId: user.userId,
                RoleId: RoleId.OrgAdmin
              }
            }
          }
        },
        {
          Group: {
            GroupMemberships: {
              some: {
                UserId: user.userId
              }
            }
          }
        }
      ],
      ...filter(paramFilter, orgIds, user.userId)
    };
  }
}

function filter(filter: string, orgIds?: number[], userId?: number): Prisma.ProjectsWhereInput {
  const selector = filter as 'organization' | 'active' | 'archived' | 'all' | 'own';
  switch (selector) {
    case 'organization':
      return {
        OrganizationId: orgIds ? { in: orgIds } : undefined,
        DateArchived: null
      };
    case 'active':
      return {
        OrganizationId: orgIds ? { in: orgIds } : undefined,
        DateActive: {
          not: null
        },
        DateArchived: null
      };
    case 'archived':
      return {
        OrganizationId: orgIds ? { in: orgIds } : undefined,
        DateArchived: {
          not: null
        }
      };
    case 'all':
      return {
        OrganizationId: orgIds ? { in: orgIds } : undefined
      };
    case 'own':
      return {
        OrganizationId: orgIds ? { in: orgIds } : undefined,
        OwnerId: userId,
        DateArchived: null
      };
  }
}

export const load = (async ({ params, locals }) => {
  locals.security.requireAuthenticated();
  let orgIds: number[] | undefined = undefined;
  if (params.orgId) {
    const orgId = parseInt(params.orgId);
    locals.security.requireMemberOfOrgOrSuperAdmin(orgId);
    orgIds = [orgId];
  } else if (!locals.security.isSuperAdmin) {
    orgIds = locals.security.organizationMemberships;
  }

  const projects = await DatabaseReads.projects.findMany({
    where: whereStatements(params.filter, locals.security, orgIds),
    include: {
      Products: {
        include: {
          ProductDefinition: true,
          WorkflowInstance: true
        }
      },
      Owner: true,
      Group: true,
      Organization: true
    },
    take: 10,
    orderBy: [
      {
        Name: 'asc'
      },
      { Id: 'asc' }
    ]
  });
  return {
    projects: pruneProjects(projects),
    pageForm: await superValidate(
      {
        page: {
          page: 0,
          size: 10
        }
      },
      valibot(projectSearchSchema)
    ),
    count: await DatabaseReads.projects.count({
      where: whereStatements(params.filter, locals.security, orgIds)
    }),
    actionForm: await superValidate(valibot(bulkProjectActionSchema)),
    productForm: await superValidate(valibot(bulkProductActionSchema)),
    productDefinitions: await DatabaseReads.productDefinitions.findMany(),
    /** allow actions other than reactivation */
    allowActions: params.filter !== 'archived',
    allowReactivate: params.filter === 'all' || params.filter === 'archived',
    userGroups: (
      await DatabaseReads.groupMemberships.findMany({
        where: {
          Group: orgIds
            ? {
                OwnerId: {
                  in: orgIds
                }
              }
            : undefined,
          UserId: locals.security.userId
        }
      })
    ).map((g) => g.GroupId),
    jobsAvailable: QueueConnected()
  };
}) satisfies PageServerLoad;

export const actions: Actions = {
  page: async function ({ params, request, locals }) {
    locals.security.requireAuthenticated();
    let orgIds: number[] | undefined = undefined;
    if (params.orgId) {
      const orgId = parseInt(params.orgId);
      locals.security.requireMemberOfOrgOrSuperAdmin(orgId);
      orgIds = [orgId];
    } else if (!locals.security.isSuperAdmin) {
      orgIds = locals.security.organizationMemberships;
    }
    const form = await superValidate(request, valibot(projectSearchSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const where: Prisma.ProjectsWhereInput = {
      ...projectFilter({
        ...form.data,
        organizationId: null
      }),
      ...whereStatements(params.filter, locals.security, orgIds)
    };

    const projects = await DatabaseReads.projects.findMany({
      where,
      include: {
        Products: {
          include: {
            ProductDefinition: true,
            WorkflowInstance: true
          }
        },
        Owner: true,
        Group: true,
        Organization: true
      },
      skip: form.data.page.size * form.data.page.page,
      take: form.data.page.size,
      orderBy: [
        {
          Name: 'asc'
        },
        { Id: 'asc' }
      ]
    });

    const count = await DatabaseReads.projects.count({ where: where });

    return { form, ok: true, query: { data: pruneProjects(projects), count } };
  },
  projectAction: async ({ request, locals, params }) => {
    locals.security.requireAuthenticated();
    let orgIds: number[] | undefined = undefined;
    if (params.orgId) {
      const orgId = parseInt(params.orgId);
      locals.security.requireMemberOfOrgOrSuperAdmin(orgId);
      orgIds = [orgId];
    } else if (!locals.security.isSuperAdmin) {
      orgIds = locals.security.organizationMemberships;
    }

    if (!QueueConnected()) return error(503);

    const form = await superValidate(request, valibot(bulkProjectActionSchema));
    if (
      !form.valid ||
      !form.data.operation ||
      (!form.data.projects?.length && form.data.projectId === null)
    ) {
      return fail(400, { form, ok: false });
    }
    // prefer single project over array
    const projects = await DatabaseReads.projects.findMany({
      where: {
        Id: { in: form.data.projectId !== null ? [form.data.projectId] : form.data.projects }
      },
      select: {
        Id: true,
        DateArchived: true,
        OwnerId: true,
        GroupId: true,
        OrganizationId: true
      }
    });

    const groups = await DatabaseReads.groupMemberships.findMany({
      where: {
        Group: orgIds
          ? {
              OwnerId: {
                in: orgIds
              }
            }
          : undefined,
        UserId: locals.security.userId
      }
    });

    projects.forEach(
      form.data.operation === 'claim'
        ? (p: (typeof projects)[0]) => locals.security.requireProjectClaimable(groups, p)
        : (p: (typeof projects)[0]) => locals.security.requireProjectWriteAccess(p)
    );

    await Promise.all(
      projects.map(async (project) => {
        await doProjectAction(
          form.data.operation,
          project,
          locals.security,
          groups.map((g) => g.GroupId)
        );
      })
    );

    return { form, ok: true };
  },
  productAction: async ({ request, locals, params }) => {
    locals.security.requireAuthenticated();
    if (params.orgId) {
      locals.security.requireMemberOfOrgOrSuperAdmin(parseInt(params.orgId));
    }

    if (!QueueConnected()) return error(503);

    const form = await superValidate(request, valibot(bulkProductActionSchema));
    if (!form.valid || !form.data.operation) return fail(400, { form, ok: false });
    // if any productId doesn't exist, 403
    // if any associated project is inaccessible, 403
    // if user modified hidden values
    if (
      (await DatabaseReads.products.count({ where: { Id: { in: form.data.products } } })) !==
      form.data.products.length
    ) {
      throw error(403);
    }
    (
      await DatabaseReads.projects.findMany({
        where: {
          Products: {
            some: {
              Id: { in: form.data.products }
            }
          }
        },
        select: {
          OwnerId: true,
          OrganizationId: true
        }
      })
    ).forEach((p) => locals.security.requireProjectWriteAccess(p));

    await Promise.all(form.data.products.map((p) => doProductAction(p, form.data.operation!)));

    return { form, ok: true };
  }
};

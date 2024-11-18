import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad, Actions } from './$types';
import { paginateSchema } from '$lib/table';
import { superValidate, fail } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { error } from '@sveltejs/kit';
import * as v from 'valibot';
import type { Prisma } from '@prisma/client';
import { idSchema } from '$lib/valibot';

const tableSchema = v.object({
  page: paginateSchema,
  sort: v.nullable(
    v.object({
      field: v.string(),
      direction: v.picklist(['asc', 'desc'])
    })
  ),
  search: v.string(),
  workflowDefinitionId: v.nullable(idSchema),
  dateUpdatedRange: v.nullable(v.tuple([v.date(), v.nullable(v.date())])),
  organizationId: v.nullable(idSchema)
});

export const load: PageServerLoad = async (event) => {
  const instances = await prisma.workflowInstances.findMany({
    select: {
      WorkflowDefinition: {
        select: {
          Name: true
        }
      },
      State: true,
      DateUpdated: true,
      Product: {
        select: {
          Id: true,
          Project: {
            select: {
              Id: true,
              Name: true,
              Organization: {
                select: {
                  Name: true
                }
              }
            }
          }
        }
      }
    },
    take: 50
  });

  return {
    instances,
    count: await prisma.workflowInstances.count(),
    form: await superValidate(
      {
        page: {
          page: 0,
          size: 50
        },
        workflowDefinitionId: null
      },
      valibot(tableSchema)
    ),
    workflowDefinitions: await prisma.workflowDefinitions.findMany({
      select: {
        Id: true,
        Name: true
      }
    })
  };
};

export const actions: Actions = {
  page: async function ({ request, locals }) {
    const session = await locals.auth();
    if ((session?.user.roles.filter(([org, role]) => role === RoleId.SuperAdmin) ?? []).length < 1)
      return error(403);
    const form = await superValidate(request, valibot(tableSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const search = form.data.search
      ? new RegExp(
          // escape regex special characters: https://stackoverflow.com/a/6969486
          form.data.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), //
          'i'
        )
      : null;

    const pids = (await prisma.products.findMany({ select: { Id: true } }))
      .filter((p) => search?.test(p.Id))
      .map((p) => p.Id);

    const where: Prisma.WorkflowInstancesWhereInput = {
      OR: [
        {
          ProductId: { in: pids }
        },
        {
          Product: {
            Project: {
              Organization: {
                Name: {
                  contains: form.data.search,
                  mode: 'insensitive'
                }
              }
            }
          }
        },
        {
          Product: {
            Project: {
              Name: {
                contains: form.data.search,
                mode: 'insensitive'
              }
            }
          }
        },
        {
          WorkflowDefinition: {
            Name: {
              contains: form.data.search,
              mode: 'insensitive'
            }
          }
        },
        {
          State: {
            contains: form.data.search,
            mode: 'insensitive'
          }
        }
      ],
      WorkflowDefinitionId: form.data.workflowDefinitionId ?? undefined,
      DateUpdated:
        form.data.dateUpdatedRange && form.data.dateUpdatedRange[1]
          ? {
              gt: form.data.dateUpdatedRange[0],
              lt: form.data.dateUpdatedRange[1]
            }
          : undefined
    };

    const instances = await prisma.workflowInstances.findMany({
      orderBy:
        form.data.sort?.field === 'product'
          ? { ProductId: form.data.sort.direction }
          : form.data.sort?.field === 'organization'
          ? { Product: { Project: { Organization: { Name: form.data.sort.direction } } } }
          : form.data.sort?.field === 'project'
          ? { Product: { Project: { Name: form.data.sort.direction } } }
          : form.data.sort?.field === 'workflow'
          ? { WorkflowDefinition: { Name: form.data.sort.direction } }
          : form.data.sort?.field === 'state'
          ? { State: form.data.sort.direction }
          : form.data.sort?.field === 'date'
          ? { DateUpdated: form.data.sort.direction }
          : undefined,
      where: where,
      select: {
        WorkflowDefinition: {
          select: {
            Name: true
          }
        },
        State: true,
        DateUpdated: true,
        Product: {
          select: {
            Id: true,
            Project: {
              select: {
                Id: true,
                Name: true,
                Organization: {
                  select: {
                    Name: true
                  }
                }
              }
            }
          }
        }
      },
      skip: form.data.page.page * form.data.page.size,
      take: form.data.page.size
    });

    return {
      form,
      ok: true,
      query: {
        data: instances,
        count: await prisma.workflowInstances.count({ where: where })
      }
    };
  }
};

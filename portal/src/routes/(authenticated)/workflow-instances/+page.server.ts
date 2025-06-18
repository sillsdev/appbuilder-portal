import { isSuperAdmin } from '$lib/utils/roles';
import { idSchema, paginateSchema } from '$lib/valibot';
import type { Prisma } from '@prisma/client';
import { error } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const tableSchema = v.object({
  page: paginateSchema,
  sort: v.nullable(
    v.object({
      field: v.string(),
      direction: v.picklist(['asc', 'desc'])
    })
  ),
  search: v.string(),
  productDefinitionId: v.nullable(idSchema),
  dateUpdatedRange: v.nullable(v.tuple([v.date(), v.nullable(v.date())])),
  organizationId: v.nullable(idSchema)
});

export const load: PageServerLoad = async (event) => {
  const instances = await prisma.workflowInstances.findMany({
    select: {
      State: true,
      DateUpdated: true,
      Product: {
        select: {
          Id: true,
          ProductDefinition: {
            select: {
              Name: true
            }
          },
          Project: {
            select: {
              Id: true,
              Name: true,
              Organization: {
                select: {
                  Id: true,
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
        }
      },
      valibot(tableSchema)
    ),
    productDefinitions: await prisma.productDefinitions.findMany({
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
    if (!isSuperAdmin(session?.user.roles)) return error(403);
    const form = await superValidate(request, valibot(tableSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const where: Prisma.WorkflowInstancesWhereInput = {
      OR: form.data.search
        ? [
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
              Product: {
                ProductDefinition: {
                  Name: {
                    contains: form.data.search,
                    mode: 'insensitive'
                  }
                }
              }
            },
            {
              State: {
                contains: form.data.search,
                mode: 'insensitive'
              }
            }
          ]
        : undefined,
      Product:
        form.data.productDefinitionId !== null || form.data.organizationId !== null
          ? {
              ProductDefinitionId: form.data.productDefinitionId ?? undefined,
              Project:
                form.data.organizationId !== null
                  ? {
                      OrganizationId: form.data.organizationId
                    }
                  : undefined
            }
          : undefined,
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
        form.data.sort?.field === 'organization'
          ? { Product: { Project: { Organization: { Name: form.data.sort.direction } } } }
          : form.data.sort?.field === 'project'
            ? { Product: { Project: { Name: form.data.sort.direction } } }
            : form.data.sort?.field === 'definition'
              ? { Product: { ProductDefinition: { Name: form.data.sort.direction } } }
              : form.data.sort?.field === 'state'
                ? { State: form.data.sort.direction }
                : form.data.sort?.field === 'date'
                  ? { DateUpdated: form.data.sort.direction }
                  : undefined,
      where: where,
      select: {
        State: true,
        DateUpdated: true,
        Product: {
          select: {
            Id: true,
            ProductDefinition: {
              select: {
                Name: true
              }
            },
            Project: {
              select: {
                Id: true,
                Name: true,
                Organization: {
                  select: {
                    Id: true,
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

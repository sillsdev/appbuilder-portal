import type { Prisma } from '@prisma/client';
import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { mapSystems } from '$lib/organizations/server';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { getUpdates } from '$lib/software-updates/server';
import { filterAdminOrgs } from '$lib/utils/roles';
import { deleteSchema, stringIdSchema } from '$lib/valibot';

const startFormSchema = v.object({
  comment: v.pipe(v.string(), v.minLength(1)),
  products: v.pipe(v.array(stringIdSchema))
});

const productsWhere: Prisma.ProductsWhereInput = {
  // Products that are rebuildable:
  // - Have already been published once
  DatePublished: { not: null },
  // - Are not currently being rebuild
  WorkflowInstance: null,
  // - Have a definition that specifies a rebuild workflow
  NOT: {
    ProductDefinition: { RebuildWorkflow: null }
  }
};

export const load = (async ({ locals, params }) => {
  if (params.orgId) {
    locals.security.requireAdminOfOrg(Number(params.orgId));
  } else {
    locals.security.requireAdminOfAny();
  }

  const organizations = await DatabaseReads.organizations.findMany({
    where: {
      Projects: { some: { Products: { some: productsWhere } } },
      ...filterAdminOrgs(locals.security, params.orgId ? Number(params.orgId) : undefined)
    },
    select: {
      Id: true,
      Name: true,
      System: {
        select: {
          SystemVersions: {
            select: {
              ApplicationTypeId: true,
              Version: true
            }
          }
        }
      },
      Projects: {
        where: {
          Products: { some: productsWhere }
        },
        select: {
          Id: true,
          Name: true,
          TypeId: true,
          Products: {
            where: productsWhere,
            select: {
              Id: true,
              ProductDefinitionId: true,
              ProductBuilds: {
                orderBy: { DateCreated: 'desc' },
                take: 1,
                select: { AppBuilderVersion: true }
              }
            }
          }
        }
      }
    }
  });

  const systems = await mapSystems(organizations);

  const presentAppTypes = new Set<number>();

  const withFilteredProducts = organizations
    .map((o) => ({
      Id: o.Id,
      Name: o.Name,
      Versions: o.System?.SystemVersions,
      Projects: o.Projects.map((pj) => ({
        ...pj,
        Products: pj.Products.filter((p) => {
          const targetVersion = systems.get(o.Id)?.get(pj.TypeId);
          const update = targetVersion && targetVersion !== p.ProductBuilds[0].AppBuilderVersion;
          if (update) {
            presentAppTypes.add(pj.TypeId);
          }
          return update;
        }).map((p) => ({
          Id: p.Id,
          ProductDefinitionId: p.ProductDefinitionId,
          OldVersion: p.ProductBuilds[0].AppBuilderVersion,
          Version: systems.get(o.Id)!.get(pj.TypeId)!
        }))
      })).filter((pj) => pj.Products.length)
    }))
    .filter((o) => o.Projects.length);

  const orgId = Number(params.orgId);
  return {
    form: await superValidate(valibot(startFormSchema)),
    applicationTypes: await DatabaseReads.applicationTypes.findMany({
      select: { Id: true, Description: true }
    }),
    productTypes: new Map(
      (
        await DatabaseReads.productDefinitions.findMany({
          select: { Id: true, Name: true, Workflow: { select: { ProductType: true } } }
        })
      ).map((pd) => [pd.Id, pd])
    ),
    organizations: withFilteredProducts,
    presentAppTypes,
    updates: await getUpdates(locals.security, orgId ? [orgId] : undefined),
    user: await DatabaseReads.users.findUniqueOrThrow({
      where: { Id: locals.security.userId },
      select: { Name: true }
    })
  };
}) satisfies PageServerLoad;

export const actions = {
  async start({ request, locals, params }) {
    if (params.orgId) {
      locals.security.requireAdminOfOrg(Number(params.orgId));
    } else {
      locals.security.requireAdminOfAny();
    }

    const form = await superValidate(request, valibot(startFormSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    const systems = await mapSystems(
      await DatabaseReads.organizations.findMany({
        where: filterAdminOrgs(locals.security, params.orgId ? Number(params.orgId) : undefined),
        select: {
          Id: true,
          System: {
            select: {
              SystemVersions: { select: { ApplicationTypeId: true, Version: true } }
            }
          }
        }
      })
    );

    const products = (
      await DatabaseReads.products.findMany({
        where: {
          Id: {
            in: form.data.products
          },
          Project: {
            Organization: {
              ...filterAdminOrgs(locals.security, params.orgId ? Number(params.orgId) : undefined)
            }
          }
        },
        select: {
          Id: true,
          Project: {
            select: {
              OrganizationId: true,
              TypeId: true
            }
          }
        }
      })
    ).filter((p) => systems.get(p.Project.OrganizationId)?.get(p.Project.TypeId));

    const update = await DatabaseWrites.softwareUpdates.create(
      {
        InitiatedById: locals.security.userId,
        Comment: form.data.comment
      },
      products.map((p) => ({
        ProductId: p.Id,
        Version: systems.get(p.Project.OrganizationId)!.get(p.Project.TypeId)!
      }))
    );

    await Promise.allSettled(
      products.map((p) =>
        doProductAction(
          p.Id,
          ProductActionType.Rebuild,
          locals.security.userId,
          form.data.comment,
          true,
          update.Id
        )
      )
    );
  },

  async cancel({ request, locals, params }) {
    if (params.orgId) {
      locals.security.requireAdminOfOrg(Number(params.orgId));
    } else {
      locals.security.requireAdminOfAny();
    }

    const form = await superValidate(request, valibot(deleteSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    const update = await DatabaseReads.softwareUpdates.findUnique({
      where: {
        Id: form.data.id
      },
      select: {
        Workflows: {
          where: {
            Product: {
              Project: {
                Organization: {
                  ...filterAdminOrgs(
                    locals.security,
                    params.orgId ? Number(params.orgId) : undefined
                  )
                }
              }
            }
          },
          select: {
            ProductId: true
          }
        }
      }
    });

    console.log(update);
    await Promise.allSettled(
      update?.Workflows.map((p) =>
        doProductAction(p.ProductId, ProductActionType.CancelWorkflow, locals.security.userId)
      ) ?? []
    );
  }
} satisfies Actions;

import { error, fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';
import { mapSystems } from '$lib/organizations/server';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { getSiteParam } from '$lib/site-params/server';
import { startFormSchema } from '$lib/software-updates';
import { getProducts, getUpdates, updatableProductsFilter } from '$lib/software-updates/server';
import { filterAdminOrgs } from '$lib/utils/roles';
import { deleteSchema } from '$lib/valibot';
import { WorkflowState } from '$lib/workflowTypes';

export const load = (async ({ locals, params }) => {
  const orgId = params.orgId ? Number(params.orgId) : undefined;
  if (orgId) {
    locals.security.requireAdminOfOrg(orgId);
  } else {
    locals.security.requireAdminOfAny();
  }

  const allowlist = await getSiteParam('software-updates', 'allow-orgs');
  if (orgId && allowlist !== 'all' && !allowlist?.includes(orgId)) {
    return error(403);
  }

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
    products: await getProducts(
      locals.security,
      orgId ? [orgId] : allowlist !== 'all' ? allowlist : undefined
    ),
    updates: await getUpdates(
      locals.security,
      orgId ? [orgId] : allowlist !== 'all' ? allowlist : undefined
    ),
    user: await DatabaseReads.users.findUniqueOrThrow({
      where: { Id: locals.security.userId },
      select: { Name: true }
    })
  };
}) satisfies PageServerLoad;

export const actions = {
  async start({ request, locals, params }) {
    const orgId = params.orgId ? Number(params.orgId) : undefined;
    if (orgId) {
      locals.security.requireAdminOfOrg(orgId);
    } else {
      locals.security.requireAdminOfAny();
    }

    const allowlist = await getSiteParam('software-updates', 'allow-orgs');
    if (orgId && allowlist !== 'all' && !allowlist?.includes(orgId)) {
      return error(403);
    }

    const form = await superValidate(request, valibot(startFormSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    const systems = await mapSystems(
      await DatabaseReads.organizations.findMany({
        where: {
          AND: [
            allowlist !== 'all' ? { Id: { in: allowlist } } : {},
            filterAdminOrgs(locals.security, orgId)
          ]
        },
        select: {
          Id: true,
          UseDefaultBuildEngine: true,
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
          AND: [
            {
              Id: {
                in: form.data.products
              }
            },
            updatableProductsFilter,
            {
              Project: {
                Organization: {
                  AND: [
                    allowlist !== 'all' ? { Id: { in: allowlist } } : {},
                    filterAdminOrgs(locals.security, orgId)
                  ]
                }
              }
            }
          ]
        },
        select: {
          Id: true,
          Project: {
            select: {
              OrganizationId: true,
              TypeId: true
            }
          },
          ProductBuilds: {
            where: {
              ProductPublications: { some: { Success: true } }
            },
            orderBy: { DateCreated: 'desc' },
            take: 1,
            select: { AppBuilderVersion: true }
          }
        }
      })
    ).filter((p) => {
      const targetVersion = systems.get(p.Project.OrganizationId)?.get(p.Project.TypeId);
      return targetVersion && targetVersion !== p.ProductBuilds[0].AppBuilderVersion;
    });

    let results: PromiseSettledResult<unknown>[] = [];

    if (products.length) {
      const update = await DatabaseWrites.softwareUpdates.create(
        {
          InitiatedById: locals.security.userId,
          Comment: form.data.comment
        },
        products.map((p) => ({
          ProductId: p.Id,
          PreviousVersion: p.ProductBuilds[0].AppBuilderVersion,
          Version: systems.get(p.Project.OrganizationId)!.get(p.Project.TypeId)!,
          Status: WorkflowState.Start
        }))
      );

      results = await Promise.allSettled(
        products.map((p) =>
          doProductAction(
            p.Id,
            ProductActionType.Rebuild,
            locals.security.userId,
            form.data.comment,
            true,
            update.Id
          ).then(() => p.Id)
        )
      );

      getQueues().SvelteSSE.add(`Update Updatable Products (update #${update.Id} started)`, {
        type: BullMQ.JobType.SvelteSSE_UpdateUpdatableProducts,
        orgIds: Array.from(new Set(products.map((p) => p.Project.OrganizationId)))
      });
    }

    return {
      form,
      data: {
        total: results.length,
        failed: results.filter((r) => r.status === 'rejected').length
      },
      ok: true
    };
  },

  async cancel({ request, locals, params }) {
    const orgId = params.orgId ? Number(params.orgId) : undefined;
    if (orgId) {
      locals.security.requireAdminOfOrg(orgId);
    } else {
      locals.security.requireAdminOfAny();
    }

    // I don't think we need to check the allowlist for cancellation. - Aidan

    const form = await superValidate(request, valibot(deleteSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    const results = await DatabaseWrites.softwareUpdates.cancelForOrg(
      form.data.id,
      orgId,
      locals.security
    );

    return {
      form,
      data: results,
      ok: true
    };
  }
} satisfies Actions;

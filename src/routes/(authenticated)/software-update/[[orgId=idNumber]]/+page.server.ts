import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { getRebuildsForOrgIds } from '$lib/software-updates/sse';
import { filterAdminOrgs } from '$lib/utils/roles';

const formSchema = v.object({
  comment: v.pipe(v.string(), v.minLength(1)),
  applicationTypeIds: v.pipe(v.array(v.number()), v.minLength(1))
});

export const load = (async ({ locals, params }) => {
  if (params.orgId) {
    locals.security.requireAdminOfOrg(Number(params.orgId));
  } else {
    locals.security.requireAdminOfAny();
  }

  const eligibleProducts = await DatabaseReads.products.findMany({
    // Products that are rebuildable:
    where: {
      // - Have already been published once
      DatePublished: { not: null },
      // - Are not currently being rebuild
      WorkflowInstance: null,
      // - Have a definition that specifies a rebuild workflow
      NOT: {
        ProductDefinition: { RebuildWorkflow: null }
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
          Name: true,
          ApplicationType: { select: { Id: true } },
          Organization: { select: { Id: true } }
        }
      },
      ProductBuilds: {
        orderBy: { DateCreated: 'desc' },
        take: 1,
        select: { AppBuilderVersion: true }
      }
    }
  });

  console.log(params);
  const systemStatuses = await DatabaseReads.systemStatuses.findMany({
    where: {
      Organization: {
        ...filterAdminOrgs(locals.security, params.orgId ? Number(params.orgId) : undefined),
        Id: {
          in: eligibleProducts.map((p) => p.Project.Organization.Id)
        }
      }
    },
    select: {
      Organization: { select: { Id: true, Name: true } },
      SystemVersions: { select: { ApplicationTypeId: true, Version: true } }
    }
  });

  const organizations = systemStatuses.map((ss) => ss.Organization.Name);
  const systems = new Map<number, Map<number, string>>(
    systemStatuses.map((s) => [
      s.Organization.Id,
      new Map(s.SystemVersions.map((v) => [v.ApplicationTypeId, v.Version]))
    ])
  );

  const products = eligibleProducts
    .filter(
      (p) =>
        p.ProductBuilds[0].AppBuilderVersion !==
        systems.get(p.Project.Organization.Id).get(p.Project.ApplicationType.Id)
    )
    .map((p) => {
      return {
        ProjectName: p.Project.Name,
        TypeId: p.Project.ApplicationType.Id,
        Id: p.Id,
        NewVersion: systems.get(p.Project.Organization.Id).get(p.Project.ApplicationType.Id)
      };
    });

  console.log(organizations);
  console.log(products);

  // Fetch all available ApplicationTypes for the form toggles
  const applicationTypes = await DatabaseReads.applicationTypes.findMany({
    select: {
      Id: true,
      Description: true
    }
  });

  const rebuilds = (await getRebuildsForOrgIds(Array.from(systems.keys()))).rebuilds;
  const form = await superValidate(valibot(formSchema));

  return {
    form,
    applicationTypes,
    products,
    organizations,
    rebuilds
  };
}) satisfies PageServerLoad;

/// ACTIONS
export const actions = {
  async start({ request, locals, params }) {
    // Determine what organizations are being affected and check security
    if (params.orgId) {
      locals.security.requireAdminOfOrg(Number(params.orgId));
    } else {
      locals.security.requireAdminOfAny();
    }

    const form = await superValidate(request, valibot(formSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    const organizations = await DatabaseReads.organizations.findMany({
      where: filterAdminOrgs(locals.security, params.orgId ? Number(params.orgId) : undefined),
      select: {
        Id: true
      }
    });

    const productsToRebuild = await getProductsForRebuild(
      organizations.map((o) => o.Id),
      form.data.applicationTypeIds
    );

    // TODO Simply give a product ID to have it rebuilt.
    // WARNING check that user has permission to rebuild a product.
    // select organizations having projects having productid matching one of these products and then locals.security.requireAdminOfOrgIn(orgs)
    // Attempt rebuilds for each affected product
    const rebuildResults = await Promise.allSettled(
      productsToRebuild.map((p) => {
        return doProductAction(p.id, ProductActionType.Rebuild, form.data.comment);
      })
    );

    // Separate successful and failed products
    const successfulProducts: typeof productsToRebuild = [];
    const failedProducts: Array<{ id: string; projectName: string; error: string }> = [];

    rebuildResults.forEach((result, index) => {
      const product = productsToRebuild[index];
      if (result.status === 'fulfilled') {
        successfulProducts.push(product);
      } else {
        failedProducts.push({
          id: product.id,
          projectName: product.projectName,
          error: result.reason instanceof Error ? result.reason.message : String(result.reason)
        });
      }
    });

    // Record only successful rebuilds in SoftwareUpdates table
    if (successfulProducts.length > 0) {
      await DatabaseWrites.softwareUpdates.recordRebuilds({
        initiatorId: locals.security.userId,
        comment: form.data.comment,
        items: successfulProducts.map((p) => ({
          buildEngineUrl: p.buildEngineUrl,
          applicationTypeId: p.applicationTypeId,
          version: p.requiredVersion!,
          productId: p.id,
          organizationId: p.organizationId
        }))
      });
    }

    return {
      form,
      ok: failedProducts.length === 0,
      ...(failedProducts.length > 0 && {
        failures: {
          count: failedProducts.length,
          products: failedProducts,
          successCount: successfulProducts.length
        }
      })
    };
  }
} satisfies Actions;

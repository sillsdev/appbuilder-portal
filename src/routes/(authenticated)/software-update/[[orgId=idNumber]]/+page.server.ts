import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { getRebuilds } from '$lib/software-updates';
import { filterAdminOrgs } from '$lib/utils/roles';

const formSchema = v.object({
  comment: v.pipe(v.string(), v.minLength(1)),
  products: v.pipe(v.array(v.string()))
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
      new Map(s.SystemVersions.map((v) => [v.ApplicationTypeId, v.Version ?? '']))
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

  // Fetch all available ApplicationTypes for the form toggles
  const applicationTypes = await DatabaseReads.applicationTypes.findMany({
    select: {
      Id: true,
      Description: true
    }
  });

  const orgId = Number(params.orgId);
  const rebuilds = await getRebuilds(locals.security, orgId ? [orgId] : undefined);
  console.log(rebuilds);
  const form = await superValidate(valibot(formSchema));

  return {
    form,
    applicationTypes,
    products,
    organizations,
    rebuilds
  };
}) satisfies PageServerLoad;

export const actions = {
  async start({ request, locals, params }) {
    if (params.orgId) {
      locals.security.requireAdminOfOrg(Number(params.orgId));
    } else {
      locals.security.requireAdminOfAny();
    }

    const form = await superValidate(request, valibot(formSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    const products = await DatabaseReads.products.findMany({
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
        Id: true
      }
    });

    await DatabaseWrites.softwareUpdates.create({
      InitiatedById: locals.security.userId,
      Comment: form.data.comment,
      Products: {
        connect: products
      }
    });

    await Promise.allSettled(
      products.map((p) => {
        return doProductAction(
          p.Id,
          ProductActionType.Rebuild,
          locals.security.userId,
          form.data.comment
        );
      })
    );
  }
} satisfies Actions;

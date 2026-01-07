import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad, RouteParams } from './$types';
import { RoleId } from '$lib/prisma';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';

/// HELPERS

/**
 * Determines the target organizations based on the user's roles.
 * If the user is a super admin, all organizations are returned.
 * Otherwise, only organizations where the user is an org admin are returned.
 * @param locals The request locals containing security information.
 * @returns An array of organization IDs.
 */
async function determineTargetOrgs(locals: App.Locals): Promise<number[]> {
  if (locals.security.isSuperAdmin) {
    const orgs = await DatabaseReads.organizations.findMany({
      select: { Id: true }
    });
    return orgs.map((o) => o.Id);
  }

  const roles = await DatabaseReads.userRoles.findMany({
    where: {
      UserId: locals.security.userId,
      RoleId: RoleId.OrgAdmin
    },
    select: { OrganizationId: true }
  });

  return roles.map((r) => r.OrganizationId);
}

async function getOrganizations(locals: App.Locals, params: RouteParams): Promise<number[]> {
  // Determine what organizations are being affected
  const organizationId = Number(params.orgId);
  const searchOrgs: number[] = isNaN(organizationId)
    ? await determineTargetOrgs(locals)
    : [organizationId];
  return searchOrgs;
}

interface ProductToRebuild {
  id: string; // Product ID (UUID)
  latestVersion: string | null;
  requiredVersion: string | null;
  projectId: number;
  projectName: string;
  applicationTypeId: number;
  buildEngineUrl: string;
}

/**
 * Fetches products that need to be rebuilt based on the provided organizations.
 * Checks to make sure the product is part of a project that has rebuildOnSoftwareUpdate enabled,
 * and that the latest product build's AppBuilderVersion does not match the required SystemVersion.
 * @param searchOrgs An array or organizations to include products from.
 * @returns Array of Products
 */
async function getProductsForRebuild(searchOrgs: number[]): Promise<ProductToRebuild[]> {
  // 1. Fetch all products that meet the initial Project/Organization criteria.
  const eligibleProducts = await DatabaseReads.products.findMany({
    where: {
      Project: {
        OrganizationId: { in: searchOrgs },
        DateArchived: null, // Project has not been archived
        RebuildOnSoftwareUpdate: true // Project setting is true
      },
      WorkflowInstance: null // Only products without active workflows
    },
    select: {
      Id: true,
      WorkflowBuildId: true, // We need this to identify the latest build, assuming WorkflowBuildId is monotonically increasing
      ProductDefinitionId: true,
      ProjectId: true,
      ProductBuilds: {
        orderBy: { Id: 'desc' }, // Order by ID descending to get the 'latest' build
        take: 1, // Only take the most recent
        select: {
          AppBuilderVersion: true
        }
      },
      Project: {
        select: {
          TypeId: true,
          Name: true,
          Organization: {
            select: {
              BuildEngineUrl: true
            }
          }
        }
      }
    }
  });

  const productsForRebuild: ProductToRebuild[] = [];

  // Batch fetch required SystemVersions for unique (BuildEngineUrl, ApplicationTypeId) pairs
  const uniqueKeys = new Set(
    eligibleProducts.map(
      (p) => `${p.Project.Organization.BuildEngineUrl ?? ''}|${p.Project.TypeId}`
    )
  );

  const systemVersionsRaw = uniqueKeys.size
    ? await DatabaseReads.systemVersions.findMany({
        where: {
          OR: Array.from(uniqueKeys).map((key) => {
            const [BuildEngineUrl, typeId] = key.split('|');
            return {
              BuildEngineUrl,
              ApplicationTypeId: Number(typeId)
            };
          })
        },
        select: {
          BuildEngineUrl: true,
          ApplicationTypeId: true,
          Version: true
        }
      })
    : [];

  const systemVersionsMap = new Map(
    systemVersionsRaw.map((sv) => [`${sv.BuildEngineUrl}|${sv.ApplicationTypeId}`, sv.Version])
  );

  // 2. Iterate through eligible products to perform the cross-model version check.
  for (const product of eligibleProducts) {
    const latestProductBuild = product.ProductBuilds[0];
    const latestVersion = latestProductBuild?.AppBuilderVersion ?? null;

    // Look up the required SystemVersion from the pre-fetched map
    const key = `${product.Project.Organization.BuildEngineUrl ?? ''}|${product.Project.TypeId}`;
    const requiredVersion = systemVersionsMap.get(key) ?? null;

    // 3. Apply the final filtering logic:
    // Is the latest build version NOT equal to the required system version?
    if (requiredVersion && latestVersion !== requiredVersion) {
      productsForRebuild.push({
        id: product.Id,
        latestVersion: latestVersion,
        requiredVersion: requiredVersion,
        projectId: product.ProjectId,
        projectName: product.Project.Name ?? 'Unknown Project',
        applicationTypeId: product.Project.TypeId,
        buildEngineUrl: product.Project.Organization.BuildEngineUrl ?? 'unknown'
      });
    }
  }

  return productsForRebuild;
}

const formSchema = v.object({
  comment: v.pipe(v.string(), v.minLength(1, 'Comment is required'))
  // Since we are only getting a comment, I do not believe we need a properties: propertiesSchema here.
});

export const load = (async ({ url, locals, params }) => {
  // Determine what organizations are being affected
  const searchOrgs = await getOrganizations(locals, params);
  if (params.orgId) locals.security.requireAdminOfOrg(Number(params.orgId));
  else locals.security.requireAdminOfOrgIn(searchOrgs);
  // Translate organization IDs to names for readability
  const names = await DatabaseReads.organizations.findMany({
    where: {
      Id: { in: searchOrgs }
    },
    select: {
      Name: true
    }
  });
  const organizationsReadable = names.map((n) => n.Name ?? 'Unknown Organization');

  // Get products that would be rebuilt
  const productsToRebuild = await getProductsForRebuild(searchOrgs);

  // Extract unique project information from products
  const projectMap = new Map<number, string>();
  for (const product of productsToRebuild) {
    projectMap.set(product.projectId, product.projectName);
  }
  const projects = Array.from(projectMap.entries()).map(([id, name]) => ({ Id: id, Name: name }));

  const form = await superValidate(valibot(formSchema));
  return {
    form,
    organizations: organizationsReadable.join(', '),
    affectedProductCount: productsToRebuild.length,
    affectedProjectCount: projects.length,
    affectedProjects: projects.map((p) => p.Name).sort(),
    affectedVersions: Array.from(new Set(productsToRebuild.map((p) => p.requiredVersion))).sort()
  };
}) satisfies PageServerLoad;

/// ACTIONS
export const actions = {
  //
  /// START: Starts rebuilds for affected organizations.
  //
  async start({ request, locals, params }) {
    // Check that form is valid upon submission
    const form = await superValidate(request, valibot(formSchema));

    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    // Determine what organizations are being affected and check security
    const searchOrgs = await getOrganizations(locals, params);
    if (params.orgId) locals.security.requireAdminOfOrg(Number(params.orgId));
    else locals.security.requireAdminOfOrgIn(searchOrgs);

    const productsToRebuild = await getProductsForRebuild(searchOrgs);

    // If no products need to be rebuilt, return an error
    if (productsToRebuild.length === 0) {
      return fail(400, {
        form,
        ok: false
      });
    }

    // Record rebuilds in SoftwareUpdates table
    const createdUpdates = await DatabaseWrites.softwareUpdates.recordRebuilds({
      initiatorId: locals.security.userId,
      comment: form.data.comment,
      items: productsToRebuild.map((p) => ({
        buildEngineUrl: p.buildEngineUrl,
        applicationTypeId: p.applicationTypeId,
        version: p.requiredVersion!,
        productId: p.id
      }))
    });

    // Get user info for display
    const user = await DatabaseReads.users.findUnique({
      where: { Id: locals.security.userId },
      select: { Name: true, Email: true }
    });

    // Start rebuilds for each affected product
    const results = await Promise.allSettled(
      productsToRebuild.map((p) => {
        return doProductAction(p.id, ProductActionType.Rebuild, form.data.comment);
      })
    );

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failureCount = results.filter((r) => r.status === 'rejected').length;

    // Attach extra data to the form object so it survives Superforms serialization
    form.message = {
      ok: true,
      initiatedBy: user?.Name || user?.Email || 'Unknown User',
      comment: form.data.comment,
      productCount: successCount,
      totalProducts: productsToRebuild.length,
      failureCount,
      timestamp: new Date().toISOString(),
      updateIds: createdUpdates.map((u) => u.Id)
    };

    return { form };
  }
} satisfies Actions;

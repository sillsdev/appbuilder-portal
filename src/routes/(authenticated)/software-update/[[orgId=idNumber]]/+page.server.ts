import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad, RouteParams } from './$types';
import { RoleId } from '$lib/prisma';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { pauseRebuild, unpauseRebuild } from '$lib/server/bullmq/pause';
import { getAuthConnection } from '$lib/server/bullmq/queues';
import { DatabaseReads } from '$lib/server/database';

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
      RoleId: { in: [RoleId.SuperAdmin, RoleId.OrgAdmin] }
    },
    select: { OrganizationId: true }
  });

  return Array.from(new Set(roles.map((r) => r.OrganizationId)));
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
}

/**
 * Fetches products that need to be rebuilt based on the provided organizations.
 * Checks to make sure the product is part of a project that has rebuildOnSoftwareUpdate enabled,
 * and that the latest product build's AppBuilderVersion does not match the required SystemVersion.
 * @param searchOrgs An array or organizations to include products from.
 * @returns Array of Pro
 */
async function getProductsForRebuild(searchOrgs: number[]): Promise<ProductToRebuild[]> {
  // 1. Fetch all products that meet the initial Project/Organization criteria.
  const eligibleProducts = await DatabaseReads.products.findMany({
    where: {
      Project: {
        OrganizationId: { in: searchOrgs },
        DateArchived: null, // Project has not been archived
        RebuildOnSoftwareUpdate: true // Project setting is true
      }
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

  // 2. Iterate through eligible products to perform the cross-model version check.
  for (const product of eligibleProducts) {
    const latestProductBuild = product.ProductBuilds[0];
    const latestVersion = latestProductBuild?.AppBuilderVersion ?? null;

    // Get the required SystemVersion for this specific project's type and organization's build engine URL.
    const requiredSystemVersion = await DatabaseReads.systemVersions.findUnique({
      where: {
        BuildEngineUrl_ApplicationTypeId: {
          BuildEngineUrl: product.Project.Organization.BuildEngineUrl ?? '',
          ApplicationTypeId: product.Project.TypeId
        }
      },
      select: {
        Version: true
      }
    });

    const requiredVersion = requiredSystemVersion?.Version ?? null;

    // 3. Apply the final filtering logic:
    // Is the latest build version NOT equal to the required system version?
    if (requiredVersion && latestVersion !== requiredVersion) {
      productsForRebuild.push({
        id: product.Id,
        latestVersion: latestVersion,
        requiredVersion: requiredVersion
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
  if (Number(params.orgId)) locals.security.requireAdminOfOrgIn(searchOrgs);
  else locals.security.requireAdminOfOrg(Number(params.orgId));
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

  const form = await superValidate(valibot(formSchema));
  return { form, organizations: organizationsReadable.join(', ') };
}) satisfies PageServerLoad;

/// ACTIONS
export const actions = {
  //
  /// START: Starts rebuilds for affected organizations.
  //
  async start({ cookies, request, locals, params }) {
    // Check that form is valid upon submission
    const form = await superValidate(request, valibot(formSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false });
    }

    // Determine what organizations are being affected and check security
    const searchOrgs = await getOrganizations(locals, params);
    if (isNaN(Number(params.orgId))) locals.security.requireAdminOfOrgIn(searchOrgs);
    else locals.security.requireAdminOfOrg(Number(params.orgId));

    const productsToRebuild = await getProductsForRebuild(searchOrgs);

    // Create a parent marker job for this rebuild batch so we can pause/unpause it
    const buildsQueue = getQueues().Builds;
    // Use the projectId from the first product to rebuild, or fallback to 0 if none
    const parentJob = await buildsQueue.add(
      `Rebuild - Software Update (${Date.now()})`,
      {
        type: BullMQ.JobType.Rebuild_Parent,
        projectId:
          productsToRebuild.length > 0
            ? ((
                await DatabaseReads.products.findUnique({
                  where: { Id: productsToRebuild[0].id },
                  select: { ProjectId: true }
                })
              )?.ProjectId ?? 0)
            : 0,
        initiatedBy: locals.security.userId
      },
      { removeOnComplete: false, removeOnFail: false }
    );

    await Promise.all(
      productsToRebuild.map((p) =>
        doProductAction(p.id, ProductActionType.Rebuild, form.data.comment, parentJob.id)
      )
    );

    return { form, ok: true, parentJobId: parentJob.id };
  },

  async pause({ request, locals }) {
    locals.security.requireAdminOfAny();
    const form = await request.formData();
    const parentJobId = String(form.get('parentJobId') ?? '');
    if (!parentJobId) return fail(400, { error: 'missing_parent' });

    const removed = await pauseRebuild(parentJobId);

    const redis = getAuthConnection();
    const key = `rebuild:pausedChildren:${parentJobId}`;
    await redis.set(key, JSON.stringify({ storedAt: Date.now(), children: removed }));
    await redis.pexpire(key, 7 * 24 * 60 * 60 * 1000);

    return { ok: true, removedCount: removed.length };
  },

  async resume({ request, locals }) {
    locals.security.requireAdminOfAny();
    const form = await request.formData();
    const parentJobId = String(form.get('parentJobId') ?? '');
    if (!parentJobId) return fail(400, { error: 'missing_parent' });

    const redis = getAuthConnection();
    const key = `rebuild:pausedChildren:${parentJobId}`;
    const stored = await redis.get(key);
    if (!stored) return fail(404, { error: 'no_stored_children' });
    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch {
      return fail(500, { error: 'malformed' });
    }
    const children = parsed.children ?? [];

    const restored = await unpauseRebuild(parentJobId, children);
    await redis.del(key);
    return { ok: true, restored };
  }
} satisfies Actions;

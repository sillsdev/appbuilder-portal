import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';

/**
 * Helper: Get all unique project IDs that contain the given products
 */
async function getProjectIdsFromProductIds(productIds: string[]): Promise<number[]> {
  if (!productIds.length) return [];
  const products = await prisma.products.findMany({
    where: { Id: { in: productIds } },
    select: { ProjectId: true }
  });
  return Array.from(new Set(products.map((p) => p.ProjectId)));
}

export type RebuildRequest = {
  buildEngineUrl: string;
  applicationTypeId: number;
  version: string; // required target version
  productId: string;
  organizationId: number;
};

/**
 * Records rebuild intents by grouping items per (engine, appType, version, organization) and
 * creating one SoftwareUpdates row per group, connecting all products in that group.
 */
export async function recordRebuilds(params: {
  initiatorId: number;
  comment: string;
  items: RebuildRequest[];
}) {
  if (!params.items.length) return [] as { Id: number }[];

  // Group items by key (organization + engine + appType + version)
  const groups = new Map<
    string,
    {
      organizationId: number;
      buildEngineUrl: string;
      applicationTypeId: number;
      version: string;
      productIds: string[];
    }
  >();

  // Populate groups
  for (const it of params.items) {
    if (!it.version) continue;
    const key = `${it.organizationId}|${it.buildEngineUrl}|${it.applicationTypeId}|${it.version}`;
    const g = groups.get(key);
    if (g) g.productIds.push(it.productId);
    else
      groups.set(key, {
        organizationId: it.organizationId,
        buildEngineUrl: it.buildEngineUrl,
        applicationTypeId: it.applicationTypeId,
        version: it.version,
        productIds: [it.productId]
      });
  }

  if (!groups.size) return [] as { Id: number }[];

  // Create SoftwareUpdates entries for each group
  const created = await prisma.$transaction(
    Array.from(groups.values()).map((g) =>
      prisma.softwareUpdates.create({
        data: {
          InitiatedById: params.initiatorId,
          Comment: params.comment,
          BuildEngineUrl: g.buildEngineUrl,
          ApplicationTypeId: g.applicationTypeId,
          Version: g.version,
          Products: { connect: g.productIds.map((Id) => ({ Id })) }
        },
        select: { Id: true }
      })
    )
  );

  // Notify SSE clients about the new software updates
  if (created.length > 0) {
    const projectIds = await getProjectIdsFromProductIds(params.items.map((it) => it.productId));
    if (projectIds.length > 0) {
      getQueues().SvelteSSE.add('Update Software Updates (rebuild initiated)', {
        type: BullMQ.JobType.SvelteSSE_UpdateSoftwareUpdates,
        projectIds
      });
    }
  }

  return created;
}

/**
 * Checks if a specific product's successful build completes any open SoftwareUpdates.
 * Called after each successful build for immediate completion detection.
 */
export async function completeForProduct(productId: string): Promise<void> {
  // Find open updates linked to this product
  const openUpdates = await prisma.softwareUpdates.findMany({
    where: {
      DateCompleted: null,
      Paused: false,
      Products: { some: { Id: productId } }
    },
    select: {
      Id: true,
      Version: true,
      DateCreated: true,
      Products: { select: { Id: true } }
    }
  });
  if (!openUpdates.length) return;

  for (const u of openUpdates) {
    if (!u.Products.length) continue;

    let ok = true;
    for (const p of u.Products) {
      // Require a successful build at the target version at or after the update start time
      const recent = await prisma.productBuilds.findFirst({
        where: {
          ProductId: p.Id,
          Success: true,
          AppBuilderVersion: u.Version,
          DateCreated: { gte: u.DateCreated ?? new Date(0) }
        },
        orderBy: { DateCreated: 'desc' },
        select: { Id: true, AppBuilderVersion: true, DateCreated: true }
      });
      if (!recent) {
        ok = false;
        break;
      }
    }

    if (ok) {
      await prisma.softwareUpdates.update({
        where: { Id: u.Id },
        data: { DateCompleted: new Date() }
      });

      // Notify SSE clients about the completed software update
      const projectIds = await getProjectIdsFromProductIds(u.Products.map((p) => p.Id));
      if (projectIds.length > 0) {
        getQueues().SvelteSSE.add(`Update Software Updates (rebuild #${u.Id} completed)`, {
          type: BullMQ.JobType.SvelteSSE_UpdateSoftwareUpdates,
          projectIds
        });
      }
    }
  }
}

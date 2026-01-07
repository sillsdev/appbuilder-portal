import prisma from './prisma';

export type RebuildItem = {
  buildEngineUrl: string;
  applicationTypeId: number;
  version: string; // required target version
  productId: string;
};

// Creates a SoftwareUpdates entry and links the provided products.
export async function createWithProducts(data: {
  InitiatedById: number;
  Comment: string;
  BuildEngineUrl: string;
  ApplicationTypeId: number;
  Version: string;
  productIds: string[];
}) {
  return prisma.softwareUpdates.create({
    data: {
      InitiatedById: data.InitiatedById,
      Comment: data.Comment,
      BuildEngineUrl: data.BuildEngineUrl,
      ApplicationTypeId: data.ApplicationTypeId,
      Version: data.Version,
      Products: {
        connect: data.productIds.map((id) => ({ Id: id }))
      }
    }
  });
}

/**
 * Records rebuild intents by grouping items per (engine, appType, version) and
 * creating one SoftwareUpdates row per group, connecting all products in that group.
 */
export async function recordRebuilds(params: {
  initiatorId: number;
  comment: string;
  items: RebuildItem[];
}) {
  if (!params.items.length) return [] as { Id: number }[];

  // Group items by key
  const groups = new Map<
    string,
    { buildEngineUrl: string; applicationTypeId: number; version: string; productIds: string[] }
  >();

  for (const it of params.items) {
    if (!it.version) continue;
    const key = `${it.buildEngineUrl}|${it.applicationTypeId}|${it.version}`;
    const g = groups.get(key);
    if (g) g.productIds.push(it.productId);
    else
      groups.set(key, {
        buildEngineUrl: it.buildEngineUrl,
        applicationTypeId: it.applicationTypeId,
        version: it.version,
        productIds: [it.productId]
      });
  }

  if (!groups.size) return [] as { Id: number }[];

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

  return created;
}

/**
 * Checks if a specific product's successful build completes any open SoftwareUpdates.
 * Called after each successful build for immediate completion detection.
 */
export async function completeForProduct(productId: string) {
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
  if (!openUpdates.length) return 0;

  let completed = 0;
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
      completed++;
    }
  }

  return completed;
}

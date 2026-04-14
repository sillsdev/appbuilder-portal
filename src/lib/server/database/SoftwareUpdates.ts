import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

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

export async function create(data: RequirePrimitive<Prisma.SoftwareUpdatesUncheckedCreateInput>) {
  return await prisma.$transaction(async (tx) => {
    const softwareUpdate = await tx.softwareUpdates.create({
      data
    });

    return softwareUpdate;
  });
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
      DateCreated: true,
      Products: {
        select: {
          Id: true,
          Project: {
            select: {
              Organization: {
                select: {
                  Id: true
                }
              }
            }
          },
          ProductBuilds: {
            orderBy: { DateCreated: 'desc' },
            take: 1,
            select: { DateCreated: true }
          }
        }
      }
    }
  });
  if (!openUpdates.length) return;

  for (const u of openUpdates) {
    let ok = true;
    for (const p of u.Products) {
      // Require a successful build at the target version at or after the update start time
      // TODO What is the correct procedure when the update does not have a date created?
      if (p.ProductBuilds[0].DateCreated < u.DateCreated) {
        ok = false;
        break;
      }
    }

    if (ok) {
      const orgIds = [...new Set<number>(u.Products.map((p) => p.Project.Organization.Id))];

      await prisma.softwareUpdates.update({
        where: { Id: u.Id },
        data: { DateCompleted: new Date() }
      });

      // Notify SSE clients about the completed software update
      const projectIds = await getProjectIdsFromProductIds(u.Products.map((p) => p.Id));
      if (projectIds.length > 0) {
        getQueues().SvelteSSE.add(`Update Software Updates (rebuild #${u.Id} completed)`, {
          type: BullMQ.JobType.SvelteSSE_UpdateSoftwareUpdates,
          orgIds
        });
      }
    }
  }
}

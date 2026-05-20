import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export type RebuildRequest = {
  buildEngineUrl: string;
  applicationTypeId: number;
  version: string; // required target version
  productId: string;
  organizationId: number;
};

export async function create(data: RequirePrimitive<Prisma.SoftwareUpdatesUncheckedCreateInput>) {
  return await prisma.softwareUpdates.create({
    data
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
      UpdatedProducts: { some: { ProductId: productId } }
    },
    select: {
      Id: true,
      DateCreated: true,
      UpdatedProducts: {
        select: {
          ProductId: true,
          Product: {
            select: {
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
      }
    }
  });
  if (openUpdates.length === 0) return;

  for (const u of openUpdates) {
    let ok = true;
    for (const p of u.UpdatedProducts) {
      // Require a successful build at the target version at or after the update start time
      // TODO What is the correct procedure when the update does not have a date created?
      if ((p.Product.ProductBuilds[0].DateCreated?.valueOf() ?? 0) < u.DateCreated.valueOf()) {
        ok = false;
        break;
      }
    }

    if (ok) {
      const orgIds = [
        ...new Set<number>(u.UpdatedProducts.map((p) => p.Product.Project.Organization.Id))
      ];

      await prisma.softwareUpdates.update({
        where: { Id: u.Id },
        data: { DateCompleted: new Date() }
      });

      // Notify SSE clients about the completed software update
      if (orgIds.length > 0) {
        getQueues().SvelteSSE.add(`Update Software Updates (rebuild #${u.Id} completed)`, {
          type: BullMQ.JobType.SvelteSSE_UpdateSoftwareUpdates,
          orgIds
        });
      }
    }
  }
}

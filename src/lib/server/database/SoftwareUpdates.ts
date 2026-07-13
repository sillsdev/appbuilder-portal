import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function create(
  data: RequirePrimitive<Prisma.SoftwareUpdatesUncheckedCreateInput>,
  products: Prisma.SoftwareUpdatesOnProductsUncheckedCreateWithoutSoftwareUpdateInput[]
) {
  return await prisma.softwareUpdates.create({
    data: { ...data, UpdatedProducts: { create: products } }
  });
}

/**
 * Checks if a specific product's build completes any open SoftwareUpdates.
 * Called after each build for immediate completion detection.
 */
export async function completeForProduct(
  productId: string,
  buildEngineBuildId: number
): Promise<void> {
  // Find open updates linked to this product
  const product = await prisma.products.findUniqueOrThrow({
    where: { Id: productId },
    select: {
      SoftwareUpdates: {
        where: { SoftwareUpdate: { DateCompleted: null }, DateCompleted: null },
        select: {
          Version: true,
          SoftwareUpdate: { select: { Id: true, DateCreated: true } }
        },
        orderBy: { DateCompleted: 'desc' }
      },
      Project: { select: { OrganizationId: true } },
      ProductBuilds: {
        where: { BuildEngineBuildId: buildEngineBuildId, Success: { not: null } },
        select: { DateCreated: true, Success: true, AppBuilderVersion: true }
      }
    }
  });

  const build = product.ProductBuilds.at(0);
  if (!build?.DateCreated) return;

  // search most recent updates first
  const update = product.SoftwareUpdates.find(
    (u) =>
      build.DateCreated!.valueOf() > u.SoftwareUpdate.DateCreated.valueOf() &&
      (!build.AppBuilderVersion || build.AppBuilderVersion === u.Version)
  )?.SoftwareUpdate;

  if (update) {
    await prisma.softwareUpdatesOnProducts.updateMany({
      where: { ProductId: productId, SoftwareUpdateId: update.Id },
      data: {
        DateCompleted: new Date(),
        // guaranteed not null by query
        Success: build.Success!
      }
    });

    const checkUpdate = !!(await prisma.softwareUpdatesOnProducts.findFirst({
      where: { SoftwareUpdateId: update.Id, DateCompleted: null },
      select: { SoftwareUpdateId: true }
    }));

    getQueues().SvelteSSE.add(
      `Update Software Updates (update #${update.Id} product ${productId} completed)`,
      {
        type: BullMQ.JobType.SvelteSSE_UpdateSoftwareUpdates,
        orgIds: checkUpdate
          ? (
              await prisma.organizations.findMany({
                where: {
                  Projects: {
                    some: {
                      Products: {
                        some: { SoftwareUpdates: { some: { SoftwareUpdateId: update.Id } } }
                      }
                    }
                  }
                },
                select: { Id: true }
              })
            ).map((o) => o.Id)
          : [product.Project.OrganizationId]
      }
    );
  }
}

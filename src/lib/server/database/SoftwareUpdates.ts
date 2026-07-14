import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { filterAdminOrgs } from '$lib/utils/roles';

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
  const workflow = await prisma.workflowInstances.findUnique({
    where: { ProductId: productId },
    select: {
      SoftwareUpdate: {
        select: {
          Id: true,
          UpdatedProducts: {
            where: { ProductId: productId },
            select: {
              Product: {
                select: {
                  ProductBuilds: {
                    where: { BuildEngineBuildId: buildEngineBuildId },
                    select: { Success: true }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!workflow?.SoftwareUpdate?.UpdatedProducts.at(0)?.Product.ProductBuilds.at(0)) {
    return;
  }

  const update = workflow.SoftwareUpdate;
  const product = update.UpdatedProducts[0].Product;
  const build = product.ProductBuilds[0];
  await prisma.softwareUpdatesOnProducts.updateMany({
    where: { ProductId: productId, SoftwareUpdateId: update.Id },
    data: {
      DateCompleted: new Date(),
      // guaranteed not null by query
      Success: build.Success!
    }
  });

  const checkUpdateIncomplete = !!(await prisma.softwareUpdatesOnProducts.findFirst({
    where: { SoftwareUpdateId: update.Id, DateCompleted: null },
    select: { SoftwareUpdateId: true }
  }));

  getQueues().SvelteSSE.add(
    `Update Software Updates (update #${update.Id} product ${productId} completed)`,
    {
      type: BullMQ.JobType.SvelteSSE_UpdateSoftwareUpdates,
      orgIds: (
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
    }
  );

  if (!checkUpdateIncomplete) {
    await prisma.softwareUpdates.update({
      where: { Id: update.Id },
      data: { DateCompleted: new Date() }
    });
  }
}

export async function cancel(updateId: number, orgId: number | undefined, security: Security) {
  const productFilter = {
    Project: {
      Organization: {
        ...filterAdminOrgs(security, orgId)
      }
    }
  };

  const update = await prisma.softwareUpdates.findUniqueOrThrow({
    where: {
      Id: updateId
    },
    select: {
      UpdatedProducts: {
        select: {
          Product: { select: { Project: { select: { OrganizationId: true } } } }
        }
      },
      Workflows: {
        where: {
          Product: productFilter
        },
        select: {
          ProductId: true
        }
      }
    }
  });

  const results = await Promise.allSettled(
    update?.Workflows.map((p) =>
      doProductAction(p.ProductId, ProductActionType.CancelWorkflow, security.userId)
    ) ?? []
  );

  await prisma.softwareUpdatesOnProducts.deleteMany({
    where: { SoftwareUpdateId: updateId, Product: productFilter }
  });

  const organizations = new Set(
    update.UpdatedProducts.flatMap((up) => up.Product.Project.OrganizationId)
  );

  if (organizations.size > 0) {
    getQueues().SvelteSSE.add(`Update Software Updates (update #${updateId} canceled)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateSoftwareUpdates,
      orgIds: Array.from(organizations)
    });

    getQueues().SvelteSSE.add(`Update Updatable Products (update #${updateId} canceled)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateUpdatableProducts,
      orgIds: Array.from(organizations)
    });
  }

  if (
    !(await prisma.softwareUpdatesOnProducts.findFirst({ where: { SoftwareUpdateId: updateId } }))
  ) {
    await prisma.softwareUpdates.deleteMany({ where: { Id: updateId } });
  }

  return {
    total: results.length,
    failed: results.filter((r) => r.status === 'rejected').length
  };
}

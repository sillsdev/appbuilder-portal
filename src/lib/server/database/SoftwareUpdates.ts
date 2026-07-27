import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import prisma from './prisma';
import type { RequirePrimitive, TXClient } from './utility';
import { ProductActionType } from '$lib/products';
import { doProductAction } from '$lib/products/server';
import { filterAdminOrgs } from '$lib/utils/roles';
import { WorkflowState } from '$lib/workflowTypes';

export async function create(
  data: RequirePrimitive<Prisma.SoftwareUpdatesUncheckedCreateInput>,
  products: Prisma.SoftwareUpdatesOnProductsUncheckedCreateWithoutSoftwareUpdateInput[]
) {
  return await prisma.softwareUpdates.create({
    data: { ...data, UpdatedProducts: { create: products } }
  });
}

export async function cancelForOrg(
  updateId: number,
  orgId: number | undefined,
  security: Security
) {
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

export async function updateStatus(
  productId: string,
  data: Pick<RequirePrimitive<Prisma.WorkflowInstancesUncheckedUpdateInput>, 'State'>,
  txClient?: TXClient
) {
  if (data.State) {
    const client = txClient ?? prisma;
    const complete =
      data.State === WorkflowState.Published || data.State === WorkflowState.Terminated;

    const product = await prisma.products.findUnique({
      where: { Id: productId },
      select: {
        Project: {
          select: {
            OrganizationId: true
          }
        },
        WorkflowInstance: {
          select: {
            SoftwareUpdateId: true
          }
        }
      }
    });

    if (product) {
      const updateId = product?.WorkflowInstance?.SoftwareUpdateId;
      const orgId = product?.Project.OrganizationId;
      if (updateId) {
        await client.softwareUpdatesOnProducts.updateMany({
          where: {
            ProductId: productId,
            SoftwareUpdateId: updateId
          },
          data: {
            Status: data.State,
            DateCompleted: complete ? new Date() : undefined
          }
        });

        const updateComplete =
          complete &&
          !(await client.softwareUpdatesOnProducts.findFirst({
            where: { SoftwareUpdateId: updateId, DateCompleted: null },
            select: { SoftwareUpdateId: true }
          }));

        getQueues().SvelteSSE.add(
          `Update Software Updates (update #${updateId} product ${productId} updated)`,
          {
            type: BullMQ.JobType.SvelteSSE_UpdateSoftwareUpdates,
            orgIds: updateComplete
              ? (
                  await client.organizations.findMany({
                    where: {
                      Projects: {
                        some: {
                          Products: {
                            some: { SoftwareUpdates: { some: { SoftwareUpdateId: updateId } } }
                          }
                        }
                      }
                    },
                    select: { Id: true }
                  })
                ).map((o) => o.Id)
              : [orgId]
          }
        );

        if (updateComplete) {
          await client.softwareUpdates.update({
            where: { Id: updateId },
            data: { DateCompleted: new Date() }
          });
        }
      }

      if (complete) {
        getQueues().SvelteSSE.add(
          `Update Updatable Products (product #${productId} ${data.State})`,
          {
            type: BullMQ.JobType.SvelteSSE_UpdateUpdatableProducts,
            orgIds: [orgId]
          }
        );
      }
    }
  }
}

import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq/index';
import { delete as deleteInstance } from './WorkflowInstances';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function create(
  productData: RequirePrimitive<Prisma.ProductsUncheckedCreateInput>
): Promise<false | string> {
  if (
    !(await validateProductBase(
      productData.ProjectId,
      productData.ProductDefinitionId,
      productData.StoreId ?? undefined,
      productData.StoreLanguageId ?? undefined
    ))
  )
    return false;

  // No additional verification steps

  try {
    const res = await prisma.products.create({
      data: productData
    });

    if (res) {
      getQueues().SvelteSSE.add(`Update Project #${productData.ProjectId} (product created)`, {
        type: BullMQ.JobType.SvelteSSE_UpdateProject,
        projectIds: [productData.ProjectId]
      });
    }

    return res.Id;
  } catch {
    return false;
  }
}

export async function update(
  id: string,
  productData: RequirePrimitive<Prisma.ProductsUncheckedUpdateInput>
): Promise<boolean> {
  // There are cases where a db lookup is not necessary to verify that it will
  // be a legal relation after the update, such as if none of the relevant
  // columns are changed, but for simplicity we just lookup once anyway
  const existing = await prisma.products.findUnique({
    where: {
      Id: id
    },
    include: {
      Project: { select: { OrganizationId: true } }
    }
  });
  const projectId = productData.ProjectId ?? existing!.ProjectId;
  const productDefinitionId = productData.ProductDefinitionId ?? existing!.ProductDefinitionId;
  const storeId = productData.StoreId ?? existing!.StoreId ?? undefined;
  const storeLanguageId = productData.StoreLanguageId ?? existing!.StoreLanguageId ?? undefined;
  if (
    !(
      existing &&
      (await validateProductBase(projectId, productDefinitionId, storeId, storeLanguageId))
    )
  )
    return false;

  // No additional verification steps

  try {
    await prisma.products.update({
      where: {
        Id: id
      },
      data: productData
    });
    getQueues().SvelteSSE.add(`Update Project #${projectId} (product updated)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProject,
      projectIds: [projectId]
    });
    if (storeId && storeId !== existing.StoreId) {
      const store = await prisma.stores.findUniqueOrThrow({ where: { Id: storeId } });
      await getQueues().Products.add(
        `Update Product #${existing.Id} (PublisherId => ${store.BuildEnginePublisherId})`,
        {
          type: BullMQ.JobType.Product_UpdateStore,
          organizationId: existing.Project.OrganizationId,
          buildEngineJobId: existing.BuildEngineJobId,
          buildEnginePublisherId: store.BuildEnginePublisherId
        }
      );
    }
  } catch {
    return false;
  }
  return true;
}

async function deleteProduct(productId: string) {
  // Delete all userTasks for this product, and delete the product
  const product = await prisma.products.findUnique({
    where: {
      Id: productId
    },
    select: {
      Project: {
        select: {
          Id: true,
          OrganizationId: true
        }
      },
      BuildEngineJobId: true
    }
  });
  await getQueues().Products.add(
    `Delete Product #${productId} from BuildEngine`,
    {
      type: BullMQ.JobType.Product_Delete,
      organizationId: product!.Project.OrganizationId,
      buildEngineJobId: product!.BuildEngineJobId
    },
    BullMQ.Retry0f600
  );
  await prisma.$transaction([
    deleteInstance(productId, product!.Project.Id),
    prisma.userTasks.deleteMany({
      where: {
        ProductId: productId
      }
    }),
    prisma.products.delete({
      where: {
        Id: productId
      }
    })
  ]);
  getQueues().SvelteSSE.add(`Update #${product?.Project.Id} (product delete)`, {
    type: BullMQ.JobType.SvelteSSE_UpdateProject,
    projectIds: [product!.Project.Id]
  });
}
export { deleteProduct as delete };

/** A product is valid if:
 * 1. The store's type matches the Workflow's store type
 * 2. The project has a RepositoryUrl
 * 3. The store is allowed by the organization
 * 4. The language is allowed by the store
 * 5. The product type is allowed by the organization
 * 6. The product type allows the project type
 */
async function validateProductBase(
  projectId: number,
  productDefinitionId: number,
  /** If this would be `null`, it is set to `undefined` by caller */
  storeId?: number,
  /** If this would be `null`, it is set to `undefined` by caller */
  storeLanguageId?: number
) {
  if (storeId === undefined) {
    return false;
  }
  const productDefinition = await prisma.productDefinitions.findUnique({
    where: {
      Id: productDefinitionId
    },
    select: {
      Id: true,
      // Store type must match Workflow store type
      Workflow: {
        select: {
          StoreTypeId: true
        }
      },
      // Project.ApplicationType must be allowed by ProductDefinition
      AllowAllApplicationTypes: true,
      ApplicationTypes: {
        select: {
          Id: true
        }
      }
    }
  });
  const project = await prisma.projects.findUnique({
    where: {
      Id: projectId,
      // Project must have a RepositoryUrl (handled by query)
      RepositoryUrl: {
        not: null
      }
    },
    select: {
      TypeId: true,
      Organization: {
        select: {
          // Store must be allowed by Organization
          Stores: {
            where: {
              Id: storeId,
              // The language, if specified, is allowed by the store
              StoreType:
                storeLanguageId !== undefined
                  ? {
                      StoreLanguages: {
                        some: {
                          Id: storeLanguageId
                        }
                      }
                    }
                  : undefined
            },
            select: {
              StoreType: {
                select: {
                  // Store type must match Workflow store type
                  Id: true,
                  StoreLanguages: {
                    where: {
                      Id: storeLanguageId
                    },
                    select: {
                      Id: true
                    }
                  }
                }
              }
            }
          },
          // Product type must be allowed by Organization
          ProductDefinitions: {
            where: {
              Id: productDefinition?.Id
            }
          }
        }
      }
    }
  });

  /** 3. The store is allowed by the organization */
  const storeInOrg = (project?.Organization.Stores.length ?? 0) > 0;

  const prodDefStore = productDefinition?.Workflow.StoreTypeId;
  const orgStore = project?.Organization.Stores[0]?.StoreType.Id;
  /** 1. The store's type matches the Workflow's store type
   *
   * Note: if both are undefined, this would be `true`; however, under those circumstances,
   * condition #3 would evaluate to `false`, rendering the whole check `false`.
   */
  const storeMatchFlowStore = prodDefStore === orgStore;

  const storeLang = project?.Organization.Stores.at(0)?.StoreType.StoreLanguages.at(0);
  /** 4. The language, if specified, is allowed by the store */
  const optionalLanguageAllowed =
    storeLanguageId === undefined || storeLang?.Id === storeLanguageId;

  const numOrgProdDefs = project?.Organization.ProductDefinitions.length;
  /** 5. The product type is allowed by the organization */
  const productInOrg = (numOrgProdDefs ?? 0) > 0;

  /** 6. The product definition allows the project type */
  const projectTypeAllowed = !!(
    productDefinition?.AllowAllApplicationTypes ||
    productDefinition?.ApplicationTypes.find((at) => at.Id === project?.TypeId)
  );

  return (
    storeInOrg &&
    storeMatchFlowStore &&
    optionalLanguageAllowed &&
    productInOrg &&
    projectTypeAllowed
  );
}

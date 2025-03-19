import type { Prisma } from '@prisma/client';
import { Workflow } from 'sil.appbuilder.portal.common';
import { BullMQ, Queues } from '../index.js';
import prisma from '../prisma.js';
import type { RequirePrimitive } from './utility.js';
import { delete as deleteInstance } from './WorkflowInstances.js';

export async function create(
  productData: RequirePrimitive<Prisma.ProductsUncheckedCreateInput>
): Promise<boolean | string> {
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
      const flowDefinition = (
        await prisma.productDefinitions.findUnique({
          where: {
            Id: productData.ProductDefinitionId
          },
          select: {
            Workflow: {
              select: {
                Id: true,
                Type: true,
                ProductType: true,
                WorkflowOptions: true
              }
            }
          }
        })
      )?.Workflow;

      if (flowDefinition) {
        await Workflow.create(res.Id, {
          productType: flowDefinition.ProductType,
          options: new Set(flowDefinition.WorkflowOptions),
          workflowType: flowDefinition.Type
        });
      }
    }

    return res.Id;
  } catch (e) {
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
    }
  });
  const projectId = productData.ProjectId ?? existing!.ProjectId;
  const productDefinitionId = productData.ProductDefinitionId ?? existing!.ProductDefinitionId;
  const storeId = productData.StoreId ?? existing!.StoreId ?? undefined;
  const storeLanguageId = productData.StoreLanguageId ?? existing!.StoreLanguageId ?? undefined;
  if (!(await validateProductBase(projectId, productDefinitionId, storeId, storeLanguageId)))
    return false;

  // No additional verification steps

  try {
    await prisma.products.update({
      where: {
        Id: id
      },
      data: productData
    });
    // TODO: Are there any other updates that need to be done?
  } catch (e) {
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
      WorkflowJobId: true
    }
  });
  await Queues.Miscellaneous.add(
    `Delete Product #${productId} from BuildEngine`,
    {
      type: BullMQ.JobType.Product_Delete,
      organizationId: product!.Project.OrganizationId,
      workflowJobId: product!.WorkflowJobId
    },
    BullMQ.Retry5e5
  );
  return prisma.$transaction([
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
}
export { deleteProduct as delete };

/** A product is valid if:
 * 1. The store's type matches the Workflow's store type
 * 2. The project has a WorkflowProjectUrl
 * 3. The store is allowed by the organization
 * 4. The language is allowed by the store
 * 5. The product type is allowed by the organization
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
      }
    }
  });
  const project = await prisma.projects.findUnique({
    where: {
      Id: projectId,
      // Project must have a WorkflowProjectUrl (handled by query)
      WorkflowProjectUrl: {
        not: null
      }
    },
    select: {
      Organization: {
        select: {
          // Store must be allowed by Organization
          OrganizationStores: {
            where: {
              StoreId: storeId,
              // The language, if specified, is allowed by the store
              Store:
                storeLanguageId !== undefined
                  ? {
                      StoreType: {
                        StoreLanguages: {
                          some: {
                            Id: storeLanguageId
                          }
                        }
                      }
                    }
                  : undefined
            },
            select: {
              Store: {
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
              }
            }
          },
          // Product type must be allowed by Organization
          OrganizationProductDefinitions: {
            where: {
              ProductDefinitionId: productDefinition?.Id
            }
          }
        }
      }
    }
  });

  /** 3. The store is allowed by the organization */
  const storeInOrg = (project?.Organization.OrganizationStores.length ?? 0) > 0;

  const prodDefStore = productDefinition?.Workflow.StoreTypeId;
  const orgStore = project?.Organization.OrganizationStores[0]?.Store.StoreType.Id;
  /** 1. The store's type matches the Workflow's store type
   *
   * Note: if both are undefined, this would be `true`; however, under those circumstances,
   * condition #3 would evaluate to `false`, rendering the whole check `false`.
   */
  const storeMatchFlowStore = prodDefStore === orgStore;

  const storeLang =
    project?.Organization.OrganizationStores.at(0)?.Store.StoreType.StoreLanguages.at(0);
  /** 4. The language, if specified, is allowed by the store */
  const optionalLanguageAllowed =
    storeLanguageId === undefined || storeLang?.Id === storeLanguageId;

  const numOrgProdDefs = project?.Organization.OrganizationProductDefinitions.length;
  /** 5. The product type is allowed by the organization */
  const productInOrg = (numOrgProdDefs ?? 0) > 0;

  return storeInOrg && storeMatchFlowStore && optionalLanguageAllowed && productInOrg;
}

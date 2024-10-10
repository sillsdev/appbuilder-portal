import type { Prisma } from '@prisma/client';
import prisma from '../prisma.js';
import { RequirePrimitive } from './utility.js';
import { BullMQ, queues } from '../index.js';

export async function create(
  productData: RequirePrimitive<Prisma.ProductsUncheckedCreateInput>
): Promise<boolean | string> {
  if (
    !(await validateProductBase(
      productData.ProjectId,
      productData.ProductDefinitionId,
      productData.StoreId,
      productData.StoreLanguageId
    ))
  )
    return false;

  // No additional verification steps

  try {
    const res = await prisma.products.create({
      data: productData
    });
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
  const storeId = productData.StoreId ?? existing!.StoreId;
  const storeLanguageId = productData.StoreLanguageId ?? existing!.StoreLanguageId;
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
          OrganizationId: true
        }
      },
      WorkflowJobId: true
    }
  });
  queues.scriptoria.add(
    `Delete Product #${productId} from BuildEngine`,
    {
      type: BullMQ.ScriptoriaJobType.Product_Delete,
      organizationId: product.Project.OrganizationId,
      workflowJobId: product.WorkflowJobId
    },
    {
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 5000 // 5 seconds
      }
    }
  );
  return prisma.$transaction([
    prisma.workflowInstances.delete({
      where: {
        ProductId: productId
      }
    }),
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
  storeId: number,
  storeLanguageId?: number
) {
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
      // Project must have a WorkflowProjectUrl
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
              StoreId: storeId
            },
            select: {
              Store: {
                select: {
                  StoreType: {
                    select: {
                      // Store type must match Workflow store type
                      Id: true,
                      // StoreLanguage must be allowed by Store, if the StoreLanguage is defined
                      StoreLanguages:
                        storeLanguageId === undefined || storeLanguageId === null
                          ? undefined
                          : {
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

  // 3. The store is allowed by the organization
  return (
    project?.Organization.OrganizationStores.length > 0 &&
    // 1. The store's type matches the Workflow's store type
    productDefinition?.Workflow.StoreTypeId ===
      project.Organization.OrganizationStores[0].Store.StoreType.Id &&
    // 2. The project has a WorkflowProjectUrl
    // handled by query
    // 4. The language is allowed by the store
    (storeLanguageId ??
      project.Organization.OrganizationStores[0].Store.StoreType.StoreLanguages.length > 0) &&
    // 5. The product type is allowed by the organization
    project.Organization.OrganizationProductDefinitions.length > 0
  );
}

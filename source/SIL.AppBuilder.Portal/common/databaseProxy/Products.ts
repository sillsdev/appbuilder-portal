import type { Prisma } from '@prisma/client';
import { Workflow } from 'sil.appbuilder.portal.common';
import { BullMQ, Queues } from '../index.js';
import prisma from '../prisma.js';
import { WorkflowType } from '../public/prisma.js';
import { update as projectUpdate } from './Projects.js';
import type { RequirePrimitive } from './utility.js';

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

      if (flowDefinition?.Type === WorkflowType.Startup) {
        await Workflow.create(res.Id, {
          productType: flowDefinition.ProductType,
          options: new Set(flowDefinition.WorkflowOptions)
        });
      }
      await updateProjectDateActive(productData.ProjectId);
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
    await updateProjectDateActive(projectId);
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
  const res = prisma.$transaction([
    prisma.workflowInstances.deleteMany({
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
  await updateProjectDateActive(product!.Project.Id);
  return res;
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
  storeId?: number,
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
                        storeLanguageId === undefined
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
    (project?.Organization.OrganizationStores.length ?? 0) > 0 &&
    // 1. The store's type matches the Workflow's store type
    productDefinition?.Workflow.StoreTypeId ===
      project?.Organization.OrganizationStores[0].Store.StoreType.Id &&
    // 2. The project has a WorkflowProjectUrl
    // handled by query
    // 4. The language, if specified, is allowed by the store
    ((storeLanguageId &&
      (project?.Organization.OrganizationStores[0].Store.StoreType.StoreLanguages.length ?? 0) >
        0) ||
      storeLanguageId === undefined) &&
    // 5. The product type is allowed by the organization
    (project?.Organization.OrganizationProductDefinitions.length ?? 0) > 0
  );
}

async function updateProjectDateActive(projectId: number) {
  const project = await prisma.projects.findUniqueOrThrow({
    where: {
      Id: projectId
    },
    select: {
      Products: {
        select: {
          WorkflowInstance: {
            select: {
              Id: true
            }
          },
          DateUpdated: true
        }
      },
      DateActive: true
    }
  });

  const projectDateActive = project.DateActive;

  let dateActive = new Date(0);
  project.Products.forEach((product) => {
    if (product.WorkflowInstance) {
      if (product.DateUpdated && product.DateUpdated > dateActive) {
        dateActive = product.DateUpdated;
      }
    }
  });

  if (dateActive > new Date(0)) {
    project.DateActive = dateActive;
  } else {
    project.DateActive = null;
  }

  if (project.DateActive != projectDateActive) {
    await projectUpdate(projectId, { DateActive: project.DateActive });
  }
}

import type { Prisma } from '@prisma/client';
import prisma from '../prisma.js';
import { update as projectUpdate } from './Projects.js';
import type { RequirePrimitive } from './utility.js';

export async function upsert(
  productId: string,
  instanceData: {
    create: Omit<RequirePrimitive<Prisma.WorkflowInstancesUncheckedCreateInput>, 'ProductId'>;
    update: Omit<RequirePrimitive<Prisma.WorkflowInstancesUncheckedUpdateInput>, 'ProductId'>;
  }
) {
  const timestamp = new Date();
  const res = await prisma.workflowInstances.upsert({
    where: {
      ProductId: productId
    },
    create: {
      ...instanceData.create,
      // don't overwrite ProductId
      ProductId: productId
    },
    update: {
      ...instanceData.update,
      // don't overwrite ProductId
      ProductId: productId
    }
  });

  if (res.DateCreated && res.DateCreated > timestamp) {
    const product = await prisma.products.findUniqueOrThrow({
      where: {
        Id: productId
      },
      select: {
        ProjectId: true
      }
    });

    await projectUpdate(product.ProjectId, { DateActive: new Date() });
  }
  return res;
}

export async function update(
  productId: string,
  data: Omit<RequirePrimitive<Prisma.WorkflowInstancesUncheckedUpdateInput>, 'ProductId'>
) {
  return await prisma.workflowInstances.update({
    where: {
      ProductId: productId
    },
    // don't overwrite ProductId
    data: { ...data, ProductId: productId }
  });
}

function deleteInstance(productId: string, projectId: number) {
  updateProjectDateActive(productId, projectId);
  markProcessFinalized(productId);
  return prisma.workflowInstances.deleteMany({ where: { ProductId: productId } });
}
export { deleteInstance as delete };

export function markProcessFinalized(ProcessId: string) {
  return prisma.$transaction([
    // I am not sure how to go about deleting WorkflowProcessScheme...
    prisma.workflowProcessTransitionHistory.deleteMany({ where: { ProcessId }}),
    prisma.workflowProcessTimer.deleteMany({ where: { ProcessId }}),
    prisma.workflowProcessInstanceStatus.deleteMany({ where: { Id: ProcessId }}),
    prisma.workflowProcessInstancePersistence.deleteMany({ where: { ProcessId }}),
    prisma.workflowProcessInstance.deleteMany({ where: { Id: ProcessId }})
  ]);
}

async function updateProjectDateActive(productId: string, projectId: number) {
  const project = await prisma.projects.findUniqueOrThrow({
    where: {
      Id: projectId
    },
    select: {
      Products: {
        where: {
          Id: { not: productId }
        },
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

import type { Prisma, PrismaClient } from '@prisma/client';
import type { ITXClientDenyList } from '@prisma/client/runtime/client';
import { update as projectUpdate } from './Projects';
import { updateStatus } from './SoftwareUpdates';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';
import type { WorkflowState } from '$lib/workflowTypes';

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

  await updateStatus(productId, instanceData.update);

  return res;
}

export async function update(
  productId: string,
  data: Omit<RequirePrimitive<Prisma.WorkflowInstancesUncheckedUpdateInput>, 'ProductId'>
) {
  await updateStatus(productId, data);
  return await prisma.workflowInstances.update({
    where: {
      ProductId: productId
    },
    // don't overwrite ProductId
    data: { ...data, ProductId: productId }
  });
}

async function deleteInstance(
  productId: string,
  projectId: number,
  status: WorkflowState,
  txClient?: Omit<PrismaClient, ITXClientDenyList>
) {
  const client = txClient ?? prisma;
  await updateProjectDateActive(productId, projectId, client);
  await updateStatus(productId, { State: status }, client);
  await client.workflowInstances.deleteMany({ where: { ProductId: productId } });
  return;
}
export { deleteInstance as delete };

async function updateProjectDateActive(
  productId: string,
  projectId: number,
  txClient?: Omit<PrismaClient, ITXClientDenyList>
) {
  const client = txClient ?? prisma;
  const project = await client.projects.findUniqueOrThrow({
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
              ProductId: true
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
    await projectUpdate(projectId, { DateActive: project.DateActive }, client);
  }
}

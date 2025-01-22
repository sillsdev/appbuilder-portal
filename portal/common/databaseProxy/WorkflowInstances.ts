import type { Prisma, PrismaPromise } from '@prisma/client';
import prisma from '../prisma.js';
import { update as projectUpdate } from './Projects.js';
import type { RequirePrimitive } from './utility.js';

export async function upsert(instanceData: {
  where: Prisma.WorkflowInstancesWhereUniqueInput;
  create: RequirePrimitive<Prisma.WorkflowInstancesUncheckedCreateInput>;
  update: RequirePrimitive<Prisma.WorkflowInstancesUncheckedUpdateInput>;
}) {
  const timestamp = new Date();
  const res = await prisma.workflowInstances.upsert(instanceData);

  if (res.DateCreated && res.DateCreated > timestamp) {
    const product = await prisma.products.findUniqueOrThrow({
      where: {
        Id: instanceData.create.ProductId
      },
      select: {
        ProjectId: true
      }
    });
  
    await projectUpdate(product.ProjectId, { DateActive: new Date() });
  }
  return res;
}

//@ts-expect-error this was complaining about it not returning a global Promise. PrismaPromise extends global Promise and is require by prisma.$transaction, which for some reason didn't like a function that otherwise returned a called function that does indeed return a PrismaPromise.
async function deleteInstance(productId: string): PrismaPromise<unknown> {
  const product = await prisma.products.findUniqueOrThrow({
    where: { Id: productId },
    select: { ProjectId: true }
  });
  const project = await prisma.projects.findUniqueOrThrow({
    where: {
      Id: product.ProjectId
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
    await projectUpdate(product.ProjectId, { DateActive: project.DateActive });
  }
  return prisma.workflowInstances.delete({ where: { ProductId: productId } });
}
export { deleteInstance as delete };


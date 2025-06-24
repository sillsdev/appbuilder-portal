import { Prisma } from '@prisma/client';
import { Queues } from '../index.js';
import prisma from '../prisma.js';

export async function create(createData: Prisma.ProductTransitionsCreateArgs) {
  try {
    const res = await prisma.productTransitions.create({
      ...createData,
      include: { Product: { select: { ProjectId: true } } }
    });
    Queues.SvelteProjectSSE.add(`Update Project #${res.Product.ProjectId} in Svelte`, [
      res.Product.ProjectId
    ]);
    return res;
  } catch (e) {
    return false;
  }
}

export async function createMany(
  createManyData: Prisma.ProductTransitionsCreateManyArgs,
  projectId: number
) {
  try {
    const res = await prisma.productTransitions.createMany({
      ...createManyData
    });
    Queues.SvelteProjectSSE.add(`Update Project #${projectId} in Svelte`, [projectId]);
    return res;
  } catch (e) {
    return false;
  }
}

export async function update(updateData: Prisma.ProductTransitionsUpdateArgs) {
  try {
    const res = await prisma.productTransitions.update({
      ...updateData,
      include: { Product: { select: { ProjectId: true } } }
    });
    Queues.SvelteProjectSSE.add(`Update Project #${res.Product.ProjectId} in Svelte`, [
      res.Product.ProjectId
    ]);
    return res;
  } catch (e) {
    return false;
  }
}

export async function deleteMany(
  deleteWhere: Prisma.ProductTransitionsDeleteManyArgs,
  projectId: number
) {
  try {
    const res = await prisma.productTransitions.deleteMany(deleteWhere);
    Queues.SvelteProjectSSE.add(`Update Project #${projectId} in Svelte`, [projectId]);
    return res;
  } catch (e) {
    return false;
  }
}

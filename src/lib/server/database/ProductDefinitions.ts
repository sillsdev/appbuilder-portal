import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function toggleForOrg(
  ProductDefinitionId: number,
  OrganizationId: number,
  enabled: boolean
) {
  const updated = !!(await prisma.organizations.update({
    where: { Id: OrganizationId },
    data: {
      ProductDefinitions: {
        [enabled ? 'connect' : 'disconnect']: {
          Id: ProductDefinitionId
        }
      }
    },
    select: {
      Id: true
    }
  }));

  if (updated) {
    getQueues().SvelteSSE.add(
      `Update Projects for Org #${OrganizationId} (product #${ProductDefinitionId} ${enabled ? 'enabled' : 'disabled'})`,
      {
        type: BullMQ.JobType.SvelteSSE_UpdateProjectOrg,
        projectIds: (
          await prisma.projects.findMany({ where: { OrganizationId }, select: { Id: true } })
        ).map((p) => p.Id)
      }
    );
  }

  return updated;
}

export async function create(
  data: RequirePrimitive<Prisma.ProductDefinitionsUncheckedCreateInput>,
  ApplicationTypes?: number[]
) {
  return await prisma.productDefinitions.create({
    data: ApplicationTypes
      ? {
          ...data,
          ApplicationTypes: {
            connect: ApplicationTypes.map((n) => ({ Id: n }))
          }
        }
      : data
  });
}

export async function update(
  id: number,
  data: RequirePrimitive<Prisma.ProductDefinitionsUncheckedCreateInput>,
  ApplicationTypes?: number[]
) {
  const updated = !!(await prisma.productDefinitions.update({
    where: { Id: id },
    data: ApplicationTypes
      ? {
          ...data,
          ApplicationTypes: {
            connect: ApplicationTypes.map((n) => ({ Id: n })),
            disconnect: (await prisma.applicationTypes.findMany({ select: { Id: true } })).filter(
              (at) => !ApplicationTypes.includes(at.Id)
            )
          }
        }
      : data
  }));

  if (updated) {
    getQueues().SvelteSSE.add(`Update Projects (product #${id} modified)`, {
      type: BullMQ.JobType.SvelteSSE_UpdateProjectOrg,
      projectIds: (
        await prisma.projects.findMany({
          where: { Organization: { ProductDefinitions: { some: { Id: id } } } },
          select: { Id: true }
        })
      ).map((p) => p.Id)
    });
  }

  return updated;
}

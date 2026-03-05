import type { Prisma } from '@prisma/client';
import { BullMQ, getQueues } from '../bullmq';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function toggleForOrg(StoreId: number, OrganizationId: number, enabled: boolean) {
  const updated = !!(await prisma.stores.update({
    where: {
      Id: StoreId,
      OR: [
        {
          OwnerId: null
        },
        {
          OwnerId: OrganizationId
        }
      ]
    },
    data: {
      Organizations: {
        [enabled ? 'connect' : 'disconnect']: {
          Id: OrganizationId
        }
      }
    },
    select: {
      Id: true
    }
  }));

  if (updated) {
    await getQueues().SvelteSSE.add(
      `Update Projects for Org #${OrganizationId} (store #${StoreId} ${enabled ? 'enabled' : 'disabled'})`,
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

export async function create(data: RequirePrimitive<Prisma.StoresUncheckedCreateInput>) {
  return await prisma.stores.create({
    data
  });
}

export async function update(
  id: number,
  data: RequirePrimitive<
    Omit<Prisma.StoresUncheckedUpdateInput, 'BuildEnginePublisherId' | 'StoreTypeId'>
  >
) {
  // don't need SSE, as the only features updated are display features
  return await prisma.stores.update({
    where: { Id: id },
    data
  });
}

import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function toggleForOrg(StoreId: number, OrganizationId: number, enabled: boolean) {
  return !!(await prisma.stores.update({
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
}

export async function create(data: RequirePrimitive<Prisma.StoresUncheckedCreateInput>) {
  return await prisma.stores.create({
    data
  });
}

export async function update(
  id: number,
  data: RequirePrimitive<Prisma.StoresUncheckedUpdateInput>
) {
  return await prisma.stores.update({
    where: { Id: id },
    data
  });
}

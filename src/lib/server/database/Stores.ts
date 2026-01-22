import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function toggleForOrg(StoreId: number, OrganizationId: number, enabled: boolean) {
  return !!(await prisma.organizations.update({
    where: { Id: OrganizationId },
    data: {
      Stores: {
        [enabled ? 'connect' : 'disconnect']: {
          Id: StoreId
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

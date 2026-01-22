import type { Prisma } from '@prisma/client';
import prisma from './prisma';
import type { RequirePrimitive } from './utility';

export async function toggleForOrg(
  ProductDefinitionId: number,
  OrganizationId: number,
  enabled: boolean
) {
  return !!(await prisma.organizations.update({
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
}

export async function create(
  data: RequirePrimitive<Prisma.ProductDefinitionsUncheckedCreateInput>
) {
  return await prisma.productDefinitions.create({
    data
  });
}

export async function update(
  id: number,
  data: RequirePrimitive<Prisma.ProductDefinitionsUncheckedCreateInput>
) {
  return await prisma.productDefinitions.update({
    where: { Id: id },
    data
  });
}

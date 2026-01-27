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

export async function setApplicationTypes(Id: number, ApplicationTypes: number[]) {
  return await prisma.productDefinitions.update({
    where: {
      Id
    },
    data: {
      ApplicationTypes: {
        connect: ApplicationTypes.map((n) => ({ Id: n })),
        disconnect: (await prisma.applicationTypes.findMany({ select: { Id: true } })).filter(
          (at) => !ApplicationTypes.includes(at.Id)
        )
      }
    },
    select: {
      Id: true,
      ApplicationTypes: {
        select: {
          Id: true
        }
      }
    }
  });
}

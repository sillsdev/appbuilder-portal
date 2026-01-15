import prisma from './prisma';

export async function toggleForOrg(
  OrganizationId: number,
  ProductDefinitionId: number,
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

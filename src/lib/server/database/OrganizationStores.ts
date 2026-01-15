import prisma from './prisma';

export async function toggleForOrg(OrganizationId: number, StoreId: number, enabled: boolean) {
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

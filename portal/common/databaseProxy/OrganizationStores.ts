import prisma from '../prisma.js';

export async function toggleForOrg(
  OrganizationId: number,
  StoreId: number,
  enabled: boolean
) {
  if (enabled) {
    // ISSUE: #1102 this extra check would be unneccessary if we could switch to composite primary keys
    const existing = await prisma.organizationStores.findFirst({
      where: { OrganizationId, StoreId },
      select: { Id: true }
    });
    if (!existing) {
      await prisma.organizationStores.create({
        data: { OrganizationId, StoreId }
      });
    }
  } else {
    await prisma.organizationStores.deleteMany({
      where: { OrganizationId, StoreId }
    });
  }
  return true;
}

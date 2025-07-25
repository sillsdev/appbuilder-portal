import prisma from './prisma.js';

export async function toggleForOrg(
  OrganizationId: number,
  ProductDefinitionId: number,
  enabled: boolean
) {
  if (enabled) {
    // ISSUE: #1102 this extra check would be unneccessary if we could switch to composite primary keys
    const existing = await prisma.organizationProductDefinitions.findFirst({
      where: { OrganizationId, ProductDefinitionId },
      select: { Id: true }
    });
    if (!existing) {
      return prisma.organizationProductDefinitions.create({
        data: { OrganizationId, ProductDefinitionId }
      });
    }
  } else {
    return prisma.organizationProductDefinitions.deleteMany({
      where: { OrganizationId, ProductDefinitionId }
    });
  }
}

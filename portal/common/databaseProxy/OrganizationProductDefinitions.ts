import prisma from '../prisma.js';

export async function updateOrganizationProductDefinitions(
  orgId: number,
  productDefinitions: number[]
) {
  const old = (
    await prisma.organizationProductDefinitions.findMany({
      where: {
        OrganizationId: orgId
      }
    })
  ).map((x) => x.ProductDefinitionId);
  const newEntries = productDefinitions.filter(
    (productDefinition) => !old.includes(productDefinition)
  );
  const removeEntries = old.filter(
    (productDefinition) => !productDefinitions.includes(productDefinition)
  );
  await prisma.$transaction([
    prisma.organizationProductDefinitions.deleteMany({
      where: {
        OrganizationId: orgId,
        ProductDefinitionId: {
          in: removeEntries
        }
      }
    }),
    prisma.organizationProductDefinitions.createMany({
      data: newEntries.map((store) => ({
        OrganizationId: orgId,
        ProductDefinitionId: store
      }))
    })
  ]);
}

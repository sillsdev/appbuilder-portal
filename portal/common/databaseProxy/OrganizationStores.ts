import prisma from '../prisma.js';

export async function updateOrganizationStores(orgId: number, stores: number[]) {
  const old = (
    await prisma.organizationStores.findMany({
      where: {
        OrganizationId: orgId
      }
    })
  ).map((x) => x.StoreId);
  const newEntries = stores.filter((store) => !old.includes(store));
  const removeEntries = old.filter((store) => !stores.includes(store));
  await prisma.$transaction([
    prisma.organizationStores.deleteMany({
      where: {
        OrganizationId: orgId,
        StoreId: {
          in: removeEntries
        }
      }
    }),
    prisma.organizationStores.createMany({
      data: newEntries.map((store) => ({
        OrganizationId: orgId,
        StoreId: store
      }))
    })
  ]);
}

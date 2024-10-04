import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const builds = await prisma.productBuilds.findMany({
    where: {
      ProductId: params.id
    },
    include: {
      ProductArtifacts: true
    }
  });
  const product = await prisma.products.findUnique({
    where: {
      Id: params.id
    },
    include: {
      ProductDefinition: true,
      Project: true
    }
  });
  return { product, builds };
}) satisfies PageServerLoad;

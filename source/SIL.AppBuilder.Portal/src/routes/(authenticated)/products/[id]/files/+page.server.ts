import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
  const builds = await prisma.productBuilds.findMany({
    orderBy: [
      {
        DateUpdated: 'desc'
      }
    ],
    where: {
      ProductId: params.id
    },
    select: {
      Id: true,
      Version: true,
      BuildId: true,
      Success: true,
      ProductArtifacts: {
        select: {
          ArtifactType: true,
          Url: true,
          FileSize: true,
          DateUpdated: true
        }
      }
    }
  });
  const product = await prisma.products.findUnique({
    where: {
      Id: params.id
    },
    select: {
      WorkflowBuildId: true,
      ProductDefinition: {
        select: {
          Name: true
        }
      },
      Project: {
        select: {
          Id: true,
          Name: true
        }
      }
    }
  });

  console.log(JSON.stringify(builds, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 4));
  return { product, builds };
}) satisfies PageServerLoad;

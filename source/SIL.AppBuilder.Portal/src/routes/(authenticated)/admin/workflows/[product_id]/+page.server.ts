import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const instance = await prisma.workflowInstances.findUnique({
    where: {
      ProductId: params.product_id
    },
    select: {
      Product: {
        select: {
          Project: {
            select: {
              Name: true
            }
          },
          ProductDefinition: {
            select: {
              Name: true
            }
          },
          ProductTransitions: {
            select: {
              DateTransition: true,
              InitialState: true
            },
            orderBy: [
              {
                DateTransition: 'desc'
              }
            ],
            take: 1
          }
        }
      },
      Snapshot: true
    }
  });
  return { instance };
};

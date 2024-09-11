import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  const instances = await prisma.workflowInstances.findMany({
    select: {
      Product: {
        select: {
          Id: true,
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
      }
    }
  });
  return { instances };
};

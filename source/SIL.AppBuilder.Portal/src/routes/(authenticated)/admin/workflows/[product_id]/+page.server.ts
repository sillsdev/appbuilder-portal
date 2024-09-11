import { prisma } from 'sil.appbuilder.portal.common';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
  const instance = await prisma.workflowInstances.findUnique({
    where: {
      ProductId: params.product_id
    },
    select: {
      ProductId: true,
      Snapshot: true
    }
  });
  return { instance };
};

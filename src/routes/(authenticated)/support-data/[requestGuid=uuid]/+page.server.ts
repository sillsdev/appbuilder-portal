import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load: PageServerLoad = async (event) => {
  event.locals.security.requireSupportDataAccess();

  const request = await DatabaseReads.supportData.findUnique({
    where: { Id: event.params.requestGuid },
    include: {
      Agent: {
        select: {
          Id: true,
          Name: true,
          Email: true
        }
      }
    }
  });

  if (!request) {
    throw error(404, 'Support data request not found');
  }

  return { request };
};

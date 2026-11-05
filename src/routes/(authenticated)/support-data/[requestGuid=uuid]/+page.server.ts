import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';
import { orgsForSupportDataAccess } from '$lib/utils/roles';

export const load: PageServerLoad = async (event) => {
  event.locals.security.requireSupportDataAccess();
  const security = event.locals.security;

  const request = await DatabaseReads.supportData.findFirst({
    where: security.isSuperAdmin
      ? { Id: event.params.requestGuid }
      : {
          Id: event.params.requestGuid,
          OrganizationId: { in: orgsForSupportDataAccess(security.sessionForm.roles) }
        },
    include: {
      Organization: {
        select: {
          Id: true,
          Name: true
        }
      },
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
  security.requireSupportDataAccess(request.OrganizationId);

  return { request };
};

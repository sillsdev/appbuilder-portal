import type { PageServerLoad } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const load = (async (event) => {
  event.locals.security.requireAdminOfOrg(parseInt(event.params.id));
  const { organization } = await event.parent();
  return {
    groups: await DatabaseReads.groups.findMany({
      where: { OwnerId: organization.Id },
      select: {
        Id: true,
        Name: true,
        Description: true,
        _count: {
          select: {
            Users: true,
            Projects: true
          }
        }
      }
    })
  };
}) satisfies PageServerLoad;

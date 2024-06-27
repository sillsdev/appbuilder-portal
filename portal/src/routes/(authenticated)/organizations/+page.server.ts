import { getOrganizationsForUser } from '$lib/prisma';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
  const auth = await event.locals.auth();
  const organizations = await getOrganizationsForUser(auth!.user.userId);
  if (organizations.length === 1) {
    return redirect(302, '/organizations/' + organizations[0].Id + '/settings');
  }
  return { organizations };
}) satisfies PageServerLoad;

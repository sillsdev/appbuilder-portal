import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
  const data = await event.parent();
  if (data.organizations.length === 1)
    return redirect(302, '/projects/organization/' + data.organizations[0].Id);
  return {};
}) satisfies PageServerLoad;

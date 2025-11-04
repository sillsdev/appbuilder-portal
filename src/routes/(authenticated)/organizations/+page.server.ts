import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';

export const load = (async (event) => {
  event.locals.security.requireAdminOfAny();

  const { organizations } = await event.parent();

  if (organizations.length === 1) {
    return redirect(302, localizeHref(`/organizations/${organizations[0].Id}/settings/info`));
  }
  return { organizations };
}) satisfies PageServerLoad;

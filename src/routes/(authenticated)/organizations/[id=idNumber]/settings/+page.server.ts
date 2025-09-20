import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';

// We don't have anything on this page currently, so just redirect to the basic info page
export const load = (async (event) => {
  event.locals.security.requireAuthenticated();
  return redirect(308, localizeHref(`/organizations/${event.params.id}/settings/info`));
}) satisfies PageServerLoad;

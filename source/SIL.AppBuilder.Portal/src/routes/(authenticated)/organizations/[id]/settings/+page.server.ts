import { localizeHref } from '$lib/paraglide/runtime';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// We don't have anything on this page currently, so just redirect to the basic info page
export const load = (async (event) => {
  const { organization } = await event.parent();
  return redirect(302, localizeHref(`/organizations/${organization.Id}/settings/info`));
}) satisfies PageServerLoad;

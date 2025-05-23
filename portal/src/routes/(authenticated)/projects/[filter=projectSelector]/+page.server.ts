import { localizeHref } from '$lib/paraglide/runtime';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
  const data = await event.parent();
  if (data.organizations.length === 1)
    return redirect(302, localizeHref(`/projects/${event.params.filter}/${data.organizations[0].Id}`));
  return {};
}) satisfies PageServerLoad;

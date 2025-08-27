import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';

export const load = (async (event) => {
  const data = await event.parent();
  let orgDefault = data.organizations[0]?.Id;

  // Try to get orgLastSelected from cookie
  const cookieHeader = event.request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/orgLastSelected=([^;]+)/);
    if (match) {
      const orgLastSelected = decodeURIComponent(match[1]);
      // Only use if it matches an org in the list
      if (data.organizations.some((org) => String(org.Id) === orgLastSelected)) {
        orgDefault = Number(orgLastSelected);
      }
    }
  }

  if (data.organizations.length >= 1) {
    return redirect(302, localizeHref(`/projects/${event.params.filter}/${orgDefault}`));
  }
  return {};
}) satisfies PageServerLoad;

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';

export const load = (async (event) => {
  event.locals.security.requireAuthenticated();
  let orgRedirect = event.locals.security.organizationMemberships[0];

  // Try to get orgLastSelected from cookie
  const cookieHeader = event.request.headers.get('cookie');
  if (cookieHeader) {
    const match = cookieHeader.match(/orgLastSelected=([^;]+)/);
    if (match) {
      const orgLastSelected = decodeURIComponent(match[1]);
      // Only use if it matches an org in the list
      if (
        !isNaN(Number(orgLastSelected)) &&
        event.locals.security.organizationMemberships.includes(Number(orgLastSelected))
      ) {
        orgRedirect = Number(orgLastSelected);
      }
    }
  }

  if (orgRedirect) {
    return redirect(302, localizeHref(`/projects/${event.params.filter}/${orgRedirect}`));
  }
  return {};
}) satisfies PageServerLoad;

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';

export const load = (async ({ params: { id }, locals }) => {
  locals.security.requireAuthenticated();
  return redirect(302, localizeHref(`/users/${id}/settings/profile`));
}) satisfies PageServerLoad;

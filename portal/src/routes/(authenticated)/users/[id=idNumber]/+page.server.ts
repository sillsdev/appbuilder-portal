import { localizeHref } from '$lib/paraglide/runtime';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params: { id } }) => {
  return redirect(302, localizeHref(`/users/${id}/settings/profile`));
}) satisfies PageServerLoad;

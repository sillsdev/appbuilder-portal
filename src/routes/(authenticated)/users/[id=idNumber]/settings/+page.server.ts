import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';

export const load = (async ({ params: { id } }) => {
  return redirect(302, localizeHref(`/users/${id}/settings/profile`));
}) satisfies PageServerLoad;

import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';

export const load: PageServerLoad = async (event) => {
  if (await event.locals.auth()) return redirect(302, localizeHref('/tasks'));
};

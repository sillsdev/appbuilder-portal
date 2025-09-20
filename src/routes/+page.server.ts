import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { DatabaseConnected } from '$lib/server/database';

export const load: PageServerLoad = async (event) => {
  event.locals.security.requireNothing();
  if (event.locals.security.userId) redirect(302, localizeHref('/tasks'));
  return {
    serviceAvailable: DatabaseConnected()
  };
};

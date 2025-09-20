import { redirect } from '@sveltejs/kit';
import { signOut } from '../../../../auth';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';

export const load: PageServerLoad = async (event) => {
  event.locals.security.requireNothing();
  if (!event.locals.security.userId) return redirect(302, localizeHref('/'));
};
export const actions: Actions = { default: signOut };

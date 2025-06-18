import { localizeHref } from '$lib/paraglide/runtime';
import { redirect } from '@sveltejs/kit';
import { signOut } from '../../../../auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (!(await event.locals.auth())?.user) return redirect(302, localizeHref('/'));
};
export const actions: Actions = { default: signOut };

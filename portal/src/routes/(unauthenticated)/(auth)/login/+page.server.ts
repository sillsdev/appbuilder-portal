import { redirect } from '@sveltejs/kit';
import { signIn } from '../../../../auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if ((await event.locals.auth())?.user) return redirect(303, '/');
};
export const actions: Actions = { default: signIn };

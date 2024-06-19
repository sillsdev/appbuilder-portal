import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if (!(await event.locals.auth())) return redirect(303, '/login');
  else return redirect(303, '/tasks');
};

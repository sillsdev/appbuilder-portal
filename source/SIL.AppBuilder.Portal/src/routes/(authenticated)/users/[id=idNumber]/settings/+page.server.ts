import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ params: { id } }) => {
  return redirect(302, '/users/' + id + '/settings/profile');
}) satisfies PageServerLoad;

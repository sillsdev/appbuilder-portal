import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

export const load: PageServerLoad = async ({ locals }) => {
  locals.security.requireNothing();
  // don't render in prod for now
  if (env.APP_ENV === 'prd') return error(404);
  return;
};

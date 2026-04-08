import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  locals.security.requireNothing();
  return { locale: locals.locale };
};

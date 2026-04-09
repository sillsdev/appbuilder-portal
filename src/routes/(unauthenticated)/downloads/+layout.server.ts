import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  locals.security.requireNothing();
  return { locale: locals.locale };
};

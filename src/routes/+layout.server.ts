import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  event.locals.security.requireNothing();
  return { session: (await event.locals.auth())! };
};

import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  event.locals.security.requireNothing();
  const uData = await event.locals.auth();
  return { session: uData! };
};

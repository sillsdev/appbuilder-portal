import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
  const uData = await event.locals.auth();
  return { session: uData };
};

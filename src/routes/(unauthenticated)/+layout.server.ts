import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async (event) => {
  if (event.locals.error) {
    // If there is an error, we throw it to be handled by the error page
    error(event.locals.error);
  }
  return {};
}) satisfies LayoutServerLoad;

import type { ServerLoadEvent } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const load = async (event: ServerLoadEvent) => {
  event.locals.security.requireNothing();

  const data = await event.parent();

  return {
    ...data,
    turnstileSiteKey: env.TURNSTILE_SITE_KEY ?? ''
  };
};

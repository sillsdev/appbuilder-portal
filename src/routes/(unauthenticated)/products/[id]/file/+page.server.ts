import { env } from '$env/dynamic/private';
import type { ServerLoadEvent } from '@sveltejs/kit';

export const load = async ({ parent }: ServerLoadEvent) => {
  const data = await parent();

  return {
    ...data,
    turnstileSiteKey: env.TURNSTILE_SITE_KEY ?? ''
  };
};

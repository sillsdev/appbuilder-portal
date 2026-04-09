import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getTranslatedManifest } from '$lib/products/server';

export const load: PageServerLoad = async ({ params, locals }) => {
  locals.security.requireNothing();
  const manifest = await getTranslatedManifest({ package: params.package }, locals.locale, [
    'title.txt',
    'short_description.txt'
  ]);
  if (!manifest) return error(404);
  return { manifest };
};

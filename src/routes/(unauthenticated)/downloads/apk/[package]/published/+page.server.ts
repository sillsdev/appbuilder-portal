import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { type Locale, deLocalizeUrl, localizeUrl } from '$lib/google-play/paraglide/runtime';
import { getTranslatedManifest } from '$lib/products/server';

export const load: PageServerLoad = async ({ params, locals, url }) => {
  locals.security.requireNothing();
  const manifest = await getTranslatedManifest({ package: params.package }, locals.locale, [
    'title.txt',
    'short_description.txt'
  ]);
  if (!manifest) return error(404);
  if (locals.locale !== manifest.language) {
    return redirect(302, localizeUrl(deLocalizeUrl(url), { locale: manifest.language as Locale }));
  }
  return { manifest };
};

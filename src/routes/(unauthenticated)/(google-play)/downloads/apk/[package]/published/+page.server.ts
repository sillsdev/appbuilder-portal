import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { deLocalizeUrl, localizeUrl } from '$lib/google-play/paraglide/runtime';
import {
  getLatestManifest,
  resolveManifestLanguage,
  translateManifest
} from '$lib/products/server';

export const load: PageServerLoad = async ({ params, locals, url }) => {
  locals.security.requireNothing();
  const fetchedManifest = await getLatestManifest({ package: params.package });
  if (!fetchedManifest) return error(404);
  const lang = resolveManifestLanguage(locals.locale, fetchedManifest?.manifest);
  if (locals.locale !== lang) {
    return redirect(302, localizeUrl(deLocalizeUrl(url), { locale: lang }));
  }
  return {
    manifest: await translateManifest(fetchedManifest, lang, ['title.txt', 'short_description.txt'])
  };
};

import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
  getLatestManifest,
  resolveManifestLanguage,
  translateManifest
} from '$lib/products/server';

export const load: PageServerLoad = async ({ params, locals }) => {
  locals.security.requireNothing();
  const fetchedManifest = await getLatestManifest({ package: params.package });
  if (!fetchedManifest) return error(404);
  // Falls back to the manifest's default language when the app has no
  // translation for the current UI locale, rather than redirecting the
  // whole page to a different locale.
  const lang = resolveManifestLanguage(locals.locale, fetchedManifest?.manifest);
  return {
    manifest: await translateManifest(fetchedManifest, lang, ['title.txt', 'short_description.txt'])
  };
};

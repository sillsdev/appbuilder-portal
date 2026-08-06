import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { deLocalizeUrl, localizeUrl } from '$lib/google-play/paraglide/runtime';
import {
  getLatestManifest,
  resolveManifestLanguage,
  translateManifest
} from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

function getFallbackIcon(appTypeName: string | null | undefined) {
  const normalizedType = appTypeName?.trim().toLowerCase() ?? '';

  if (normalizedType === 'keyboardappbuilder') return '/placeholder-kab.png';
  if (normalizedType === 'dictionaryappbuilder') return '/placeholder-dab.png';
  if (normalizedType === 'scriptureappbuilder' || normalizedType === 'readingappbuilder') {
    return '/placeholder-sab-rab.png';
  }

  return '/placeholder-sab-rab.png';
}

export const load: LayoutServerLoad = async ({ locals, params, url }) => {
  locals.security.requireNothing();

  const productId = params.productId?.trim();
  if (!productId) {
    throw error(404);
  }

  let fetchedManifest: Awaited<ReturnType<typeof getLatestManifest>> = null;
  try {
    fetchedManifest = await getLatestManifest({ productId });
  } catch {
    throw error(404);
  }

  if (!fetchedManifest) throw error(404);

  const manifestLanguage = resolveManifestLanguage(locals.locale, fetchedManifest.manifest);
  if (locals.locale !== manifestLanguage) {
    throw redirect(302, localizeUrl(deLocalizeUrl(url), { locale: manifestLanguage }));
  }

  const translatedManifest = await translateManifest(fetchedManifest, manifestLanguage, [
    'title.txt',
    'short_description.txt',
    'full_description.txt',
    'description.txt'
  ]);

  const product = await DatabaseReads.products.findUnique({
    where: { Id: fetchedManifest.productId },
    select: {
      Id: true,
      Project: {
        select: {
          Name: true,
          ApplicationType: { select: { Name: true } }
        }
      },
      Store: {
        select: {
          GooglePlayTitle: true
        }
      }
    }
  });

  if (!product) throw error(404);

  const developer = product.Store.GooglePlayTitle?.trim() || 'Unknown developer';
  const longDesc =
    translatedManifest['full_description.txt'] || translatedManifest['description.txt'] || '';
  const fallbackIcon = getFallbackIcon(product.Project.ApplicationType?.Name);

  const app = {
    id: product.Id,
    icon: translatedManifest.icon || fallbackIcon,
    name: translatedManifest['title.txt'] || product.Project.Name || 'App',
    developer,
    language: translatedManifest.language,
    languages: translatedManifest.languages,
    themeColor: translatedManifest.color || null,
    shortDesc: translatedManifest['short_description.txt'] || '',
    longDesc
  };

  return {
    app,
    productId: app.id
  };
};

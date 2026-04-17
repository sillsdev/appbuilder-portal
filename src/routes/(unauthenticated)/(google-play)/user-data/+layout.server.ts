import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { deLocalizeUrl, localizeUrl } from '$lib/google-play/paraglide/runtime';
import type { AppInfo } from '$lib/products/UDMtypes';
import {
  getLatestManifest,
  resolveManifestLanguage,
  translateManifest
} from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getSearchParam(url: URL, keys: string[]) {
  for (const key of keys) {
    const value = url.searchParams.get(key)?.trim();
    if (value) return value;
  }
  return '';
}

export const load: LayoutServerLoad = async ({ locals, url }) => {
  locals.security.requireNothing();

  const queryProductId = getSearchParam(url, ['productId']);
  const queryPackage = getSearchParam(url, ['package', 'id']);
  const normalizedProductId =
    queryProductId && UUID_PATTERN.test(queryProductId) ? queryProductId : '';

  if (!normalizedProductId && !queryPackage) {
    throw error(400, 'Missing product identifier');
  }

  let fetchedManifest = normalizedProductId
    ? await getLatestManifest({ productId: normalizedProductId })
    : null;

  if (!fetchedManifest && queryPackage) {
    fetchedManifest = await getLatestManifest({ package: queryPackage });
  }

  if (!fetchedManifest) throw error(404);

  const lang = resolveManifestLanguage(locals.locale, fetchedManifest.manifest);
  if (locals.locale !== lang) {
    throw redirect(302, localizeUrl(deLocalizeUrl(url), { locale: lang }));
  }

  const translatedManifest = await translateManifest(fetchedManifest, lang, [
    'title.txt',
    'short_description.txt',
    'full_description.txt',
    'description.txt'
  ]);

  const product = await DatabaseReads.products.findUnique({
    where: { Id: fetchedManifest.productId },
    select: {
      Id: true,
      PackageName: true,
      Project: {
        select: {
          Name: true,
          Organization: { select: { Name: true } }
        }
      }
    }
  });

  if (!product) throw error(404);

  const canonicalPackage = queryPackage || product.PackageName || '';
  const developer =
    product.Project.Organization?.Name ?? product.Project.Name ?? 'Unknown developer';
  const longDesc =
    translatedManifest['full_description.txt'] || translatedManifest['description.txt'] || '';

  const app: AppInfo = {
    id: product.Id,
    icon: translatedManifest.icon || null,
    name: translatedManifest['title.txt'] || product.Project.Name || 'App',
    developer,
    themeColor: translatedManifest.color || null,
    shortDesc: translatedManifest['short_description.txt'] || '',
    longDesc
  };

  const udmQuery = new URLSearchParams({
    productId: app.id,
    ...(canonicalPackage ? { package: canonicalPackage } : {})
  }).toString();

  return {
    app,
    productId: app.id,
    packageName: canonicalPackage || null,
    udmQuery
  };
};

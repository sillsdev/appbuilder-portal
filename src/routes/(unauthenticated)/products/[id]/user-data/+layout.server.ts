import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

import { getLocale } from '$lib/paraglide/runtime';
import type { AppInfo, PlayListingManifest } from '$lib/products/UDMtypes';
import { getPublishedFile } from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

/** Escape user-provided strings when building RegExp patterns. */
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Pick the "best" manifest language for a requested locale.
 */
function resolveManifestLanguage(
  requestedLocale: string,
  available: string[],
  fallbackLocale?: string
) {
  // exact match first (e.g. "fr-FR")
  if (available.includes(requestedLocale)) return requestedLocale;

  // then match the base language (e.g. "fr" matches "fr-FR")
  const requestedBase = requestedLocale.split('-')[0];
  const baseMatch = available.find((lang) => lang.split('-')[0] === requestedBase);
  if (baseMatch) return baseMatch;

  // then use manifest default language when present
  if (fallbackLocale && available.includes(fallbackLocale)) return fallbackLocale;

  // finally, fall back to the first available language
  return available.at(0) ?? null;
}

/**
 * Find a language-specific file path in the manifest file list.
 * Manifests usually use "<lang>/<file>.txt" but we keep the search flexible.
 */
function findFilePath(files: string[], language: string, filename: string) {
  // Most manifests store entries like: "<lang>/<file>.txt"
  const exact = new RegExp(`(^|/)${escapeRegExp(language)}/${escapeRegExp(filename)}$`);
  return (
    files.find((p) => exact.test(p)) ?? files.find((p) => p.includes(`${language}/${filename}`))
  );
}

/**
 * Fetch a text file from the listing bundle and return trimmed contents.
 * Returns empty string on any error to keep the page resilient.
 */
async function fetchTextFile(baseUrl: URL, files: string[], language: string, filename: string) {
  const path = findFilePath(files, language, filename) ?? `${language}/${filename}`;
  const fileUrl = new URL(path, baseUrl);
  if (fileUrl.origin !== baseUrl.origin) return '';
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) return '';
    return (await res.text()).trim();
  } catch {
    return '';
  }
}

/**
 * The manifest's `icon` field can be absolute or relative to the listing bundle.
 */
function resolveIconUrl(icon: string | null | undefined, baseUrl: URL) {
  if (!icon) return null;
  try {
    return new URL(icon, baseUrl).toString();
  } catch {
    return null;
  }
}

export const load: LayoutServerLoad = async ({ params, locals }) => {
  // This is a public route by design.
  locals.security.requireNothing();

  // Basic product/project context (used for a fallback "developer" value).
  const product = await DatabaseReads.products.findUnique({
    where: { Id: params.id },
    select: {
      Id: true,
      Project: {
        select: {
          Name: true,
          Organization: { select: { Name: true } }
        }
      }
    }
  });

  if (!product) throw error(404);

  // "Developer" isn't a first-class concept in our schema; use org name when available.
  const developer =
    product.Project.Organization?.Name ?? product.Project.Name ?? 'Unknown developer';

  // Always return an `app` object so pages can render even when listing data is missing.
  const app: AppInfo = {
    id: product.Id,
    icon: null,
    name: product.Project.Name ?? 'App',
    developer,
    themeColor: null,
    shortDesc: '',
    longDesc: ''
  };

  const manifestArtifact = await getPublishedFile(product.Id, 'play-listing-manifest');
  if (!manifestArtifact?.Url) return { app };

  // Parse the JSON manifest (best-effort; don't fail page rendering).
  let manifest: PlayListingManifest | null = null;
  try {
    manifest = (await fetch(manifestArtifact.Url).then((r) => r.json())) as PlayListingManifest;
  } catch {
    manifest = null;
  }
  if (!manifest) return { app };

  const artifactUrl = new URL(manifestArtifact.Url);

  let baseUrl: URL;
  try {
    baseUrl = manifest.url ? new URL(manifest.url, artifactUrl) : artifactUrl;
    if (baseUrl.origin !== artifactUrl.origin) return { app };
  } catch {
    return { app };
  }

  // Use the URL locale to decide which language variant to render.
  const requestedLocale = getLocale();
  const language =
    resolveManifestLanguage(
      requestedLocale,
      manifest.languages ?? [],
      manifest['default-language']
    ) ??
    manifest['default-language'] ??
    requestedLocale;

  const files = manifest.files ?? [];

  // Listing text is stored in separate files; fetch the current locale's copy.
  const title = await fetchTextFile(baseUrl, files, language, 'title.txt');
  const shortDesc = await fetchTextFile(baseUrl, files, language, 'short_description.txt');
  // Prefer full_description when present (Google Play listing). Fall back to "description.txt" if needed.
  const longDesc =
    (await fetchTextFile(baseUrl, files, language, 'full_description.txt')) ||
    (await fetchTextFile(baseUrl, files, language, 'description.txt'));

  app.icon = resolveIconUrl(manifest.icon, baseUrl);
  app.themeColor = manifest.color || null;
  app.name = title || app.name;
  app.shortDesc = shortDesc;
  app.longDesc = longDesc;

  return { app };
};

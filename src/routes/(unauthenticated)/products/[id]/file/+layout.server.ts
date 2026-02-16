import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

import { getLocale, baseLocale } from '$lib/paraglide/runtime';
import { getPublishedFile } from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

/**
 * Public (unauthenticated) product pages need "store listing" metadata such as:
 * icon, app name, theme color, and localized short/long descriptions.
 *
 * That information is published by the build/publish pipeline as a
 * `play-listing-manifest` artifact (JSON) plus a set of per-language text files
 * like `title.txt` and `short_description.txt`.
 *
 * We fetch those published artifacts at request time so:
 * - the page renders with real product data, and
 * - the selected locale (URL locale via Paraglide) can determine which
 *   language files to read.
 */

type PlayListingManifest = {
  url: string; // Base URL prefix where the listing files can be fetched from.
  icon: string; // Icon path (or URL) inside the listing bundle.
  color: string; // Brand color hex (e.g. "#1563ff")
  ['default-language']: string; // Default language tag for the listing bundle (e.g. "en-US").
  languages: string[]; // Languages included in the bundle (language tags).
  files: string[]; // Paths to files within the bundle (usually "<lang>/<file>.txt").
};

type AppInfo = {
  id: string;
  icon: string | null;
  name: string;
  developer: string;
  themeColor: string | null;
  shortDesc: string;
  longDesc: string;
};

type ArtifactRef = {
  Url: string | null;
};

/**
 * Paraglide's `getLocale()` depends on server-side async local storage.
 * During some edge cases (misconfigured middleware/tests), it can throw.
 * For this view we prefer a safe fallback over failing the whole request.
 */
function safeGetLocale() {
  try {
    return getLocale();
  } catch {
    return baseLocale;
  }
}

/** Escape user-provided strings when building RegExp patterns. */
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Pick the "best" manifest language for a requested locale.
 * - exact match first (e.g. "fr-FR")
 * - then match the base language (e.g. "fr" matches "fr-FR")
 * - then use manifest default language when present
 * - finally, fall back to the first available language
 */
function resolveManifestLanguage(
  requestedLocale: string,
  available: string[],
  fallbackLocale?: string
) {
  if (available.includes(requestedLocale)) return requestedLocale;

  const requestedBase = requestedLocale.split('-')[0];
  const baseMatch = available.find((lang) => lang.split('-')[0] === requestedBase);
  if (baseMatch) return baseMatch;

  if (fallbackLocale && available.includes(fallbackLocale)) return fallbackLocale;
  return available.at(0) ?? null;
}

/**
 * Find a language-specific file path in the manifest file list.
 * Manifests usually use "<lang>/<file>.txt" but we keep the search flexible.
 */
function findFilePath(files: string[], language: string, filename: string) {
  // Most manifests store entries like: "<lang>/<file>.txt"
  const exact = new RegExp(`(^|/)${escapeRegExp(language)}/${escapeRegExp(filename)}$`);
  return files.find((p) => exact.test(p)) ?? files.find((p) => p.includes(`${language}/${filename}`));
}

/**
 * Fetch a text file from the listing bundle and return trimmed contents.
 * Returns empty string on any error to keep the page resilient.
 */
async function fetchTextFile(baseUrl: URL, files: string[], language: string, filename: string) {
  const path = findFilePath(files, language, filename) ?? `${language}/${filename}`;
  const fileUrl = new URL(path, baseUrl);
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) return '';
    return (await res.text()).trim();
  } catch {
    return '';
  }
}

/**
 * The manifest's `icon` field can be:
 * - an absolute URL (older manifests), or
 * - a relative path within the listing bundle (most common).
 *
 * The bucket/hostname in stored listing URLs can change over time. The artifact
 * URL in our DB is updated, but the manifest content may still have the old host.
 * For absolute icon URLs, rewrite host/protocol to match the artifact host.
 */
function resolveIconUrl(icon: string | null | undefined, baseUrl: URL, artifactUrl: URL) {
  if (!icon) return null;
  try {
    const iconUrl = new URL(icon);
    iconUrl.host = artifactUrl.host;
    iconUrl.protocol = artifactUrl.protocol;
    return iconUrl.toString();
  } catch {
    return new URL(icon, baseUrl).toString();
  }
}

/**
 * Fallback for UDM pages: if a product has not been successfully published yet,
 * use the latest build artifact so app metadata can still be displayed.
 */
async function getLatestBuiltFile(productId: string, artifactType: string): Promise<ArtifactRef | null> {
  const builds = await DatabaseReads.productBuilds.findMany({
    where: { ProductId: productId },
    include: {
      ProductArtifacts: {
        select: {
          ArtifactType: true,
          Url: true
        }
      }
    },
    orderBy: { Id: 'desc' }
  });

  for (const build of builds) {
    const artifact = build.ProductArtifacts.find((a) => a.ArtifactType === artifactType);
    if (artifact?.Url) return artifact;
  }

  return null;
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
  const developer = product.Project.Organization?.Name ?? product.Project.Name ?? 'Unknown developer';

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

  // Prefer published manifest; fall back to latest built manifest if not published yet.
  const manifestArtifact =
    (await getPublishedFile(product.Id, 'play-listing-manifest')) ??
    (await getLatestBuiltFile(product.Id, 'play-listing-manifest'));
  if (!manifestArtifact?.Url) return { app };

  // Parse the JSON manifest (best-effort; don't fail page rendering).
  let manifest: PlayListingManifest | null = null;
  try {
    manifest = (await fetch(manifestArtifact.Url).then((r) => r.json())) as PlayListingManifest;
  } catch {
    manifest = null;
  }
  if (!manifest) return { app };

  // Used to re-home URLs if the underlying storage hostname/bucket changes.
  const artifactUrl = new URL(manifestArtifact.Url);

  let baseUrl: URL | null = null;
  try {
    baseUrl = new URL(manifest.url);
    // The bucket/hostname stored in the manifest can change; the artifact URL is updated.
    baseUrl.host = artifactUrl.host;
    baseUrl.protocol = artifactUrl.protocol;
  } catch {
    baseUrl = null;
  }
  if (!baseUrl) return { app };

  // Use the URL locale to decide which language variant to render.
  const requestedLocale = safeGetLocale();
  const language =
    resolveManifestLanguage(requestedLocale, manifest.languages ?? [], manifest['default-language']) ??
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

  app.icon = resolveIconUrl(manifest.icon, baseUrl, artifactUrl);
  app.themeColor = manifest.color || null;
  app.name = title || app.name;
  app.shortDesc = shortDesc;
  app.longDesc = longDesc;

  return { app };
};

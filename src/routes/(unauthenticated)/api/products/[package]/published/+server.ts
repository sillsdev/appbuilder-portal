import { getFileFromManifest, getLatestManifest } from '$lib/products/server';

export async function GET({ params, locals }) {
  locals.security.requireNothing();
  const fetchedManifest = await getLatestManifest({ package: params.package });
  if (!fetchedManifest) return new Response(null, { status: 404 });

  const { manifest, baseUrl, productId, apkSize } = fetchedManifest;

  return new Response(
    JSON.stringify({
      ...manifest,
      id: productId,
      link: `/api/products/${productId}/files/published/apk`,
      size: apkSize,
      icon: new URL(manifest.icon, baseUrl),
      titles: Object.fromEntries(
        await Promise.all(
          manifest.languages.map(async (lang) => [
            lang,
            await getFileFromManifest(lang, 'title.txt', manifest, baseUrl)
          ])
        )
      ),
      descriptions: Object.fromEntries(
        await Promise.all(
          manifest.languages.map(async (lang) => [
            lang,
            await getFileFromManifest(lang, 'short_description.txt', manifest, baseUrl)
          ])
        )
      ),
      url: undefined,
      files: undefined
    }),
    { status: 200 }
  );
}

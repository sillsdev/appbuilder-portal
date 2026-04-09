import { getTranslatedManifest } from '$lib/products/server';

export async function GET({ params, locals }) {
  locals.security.requireNothing();
  const res = await getTranslatedManifest({ package: params.package }, locals.locale, [
    'title.txt',
    'short_description.txt'
  ]);
  return res
    ? new Response(JSON.stringify(res), { status: 200 })
    : new Response(null, { status: 404 });
}

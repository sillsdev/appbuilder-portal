import { error, redirect } from '@sveltejs/kit';
import { getArtifactHeaders, getPublishedFile } from '$lib/products/server';

export async function GET({ params, locals }) {
  locals.security.requireNothing();
  const productArtifact = await getPublishedFile({ productId: params.product_id }, params.type);
  if (!productArtifact?.Url) {
    return error(404);
  }
  return redirect(302, productArtifact.Url);
}

export async function HEAD({ params, request, locals }) {
  locals.security.requireNothing();
  const ifModifiedSince = request.headers.get('If-Modified-Since') ?? '';

  const res = await getArtifactHeaders(params.product_id, params.type);
  if (!res) return error(404);

  const { headers } = res;

  if (ifModifiedSince === headers['Last-Modified']) {
    return new Response(null, {
      status: 304,
      headers
    });
  }

  return new Response(null, {
    status: 200,
    headers
  });
}

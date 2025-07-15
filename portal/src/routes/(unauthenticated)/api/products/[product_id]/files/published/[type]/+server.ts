import { error, redirect } from '@sveltejs/kit';
import { getFileInfo } from '$lib/products';
import { getPublishedFile } from '$lib/products/server';

export async function GET({ params }) {
  const productArtifact = await getPublishedFile(params.product_id, params.type);
  if (!productArtifact?.Url) {
    return error(404);
  }
  return redirect(302, productArtifact.Url);
}

export async function HEAD({ params, request }) {
  const ifModifiedSince = request.headers.get('If-Modified-Since') ?? '';

  const res = await _getHeaders(params.product_id, params.type);
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

export async function _getHeaders(product_id: string, type: string) {
  const productArtifact = await getPublishedFile(product_id, type);
  if (!productArtifact?.Url) return null;

  const { lastModified, fileSize } = await getFileInfo(productArtifact.Url);

  const headers: { 'Last-Modified': string; 'Content-Length'?: string } = {
    'Last-Modified': lastModified
  };

  if (fileSize) {
    headers['Content-Length'] = fileSize;
  }

  return { product: productArtifact, headers };
}

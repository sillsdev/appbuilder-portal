import { getFileInfo } from '$lib/products';
import { getPublishedFile } from '$lib/products/server';
import { error, redirect } from '@sveltejs/kit';

export async function GET({ params }) {
  const productArtifact = await getPublishedFile(params.product_id, params.type);
  if (!productArtifact?.Url) {
    return error(404);
  }
  return redirect(302, productArtifact.Url);
}

export async function HEAD({ params, request }) {
  const ifModifiedSince = request.headers.get('If-Modified-Since') ?? '';

  const productArtifact = await getPublishedFile(params.product_id, params.type);
  if (!productArtifact?.Url) {
    return error(404);
  }

  const { lastModified, fileSize } = await getFileInfo(productArtifact.Url);

  const headers: Record<string, string> = {
    'Last-Modified': lastModified
  }

  if (fileSize) {
    headers['Content-Length'] = fileSize;
  }

  if (ifModifiedSince === lastModified) {
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

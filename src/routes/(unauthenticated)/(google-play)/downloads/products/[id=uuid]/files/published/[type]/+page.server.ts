import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getArtifactHeaders } from '$lib/products/server';

export const load: PageServerLoad = async ({ params, locals }) => {
  locals.security.requireNothing();
  const file = await getArtifactHeaders(params.id, params.type);
  if (!file) return error(404);
  return file;
};

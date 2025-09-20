import { error } from '@sveltejs/kit';
import { _getHeaders } from '../../../../../../api/products/[product_id]/files/published/[type]/+server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  locals.security.requireNothing();
  const file = await _getHeaders(params.id, params.type);
  if (!file) return error(404);
  return file;
};

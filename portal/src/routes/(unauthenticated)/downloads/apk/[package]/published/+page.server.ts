import { error } from '@sveltejs/kit';
import { _getManifest } from '../../../../api/products/[package]/published/+server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const manifest = await _getManifest(params.package);
  if (!manifest) return error(404);
  return { manifest };
};

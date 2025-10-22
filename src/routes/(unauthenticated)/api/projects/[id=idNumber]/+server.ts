import { json } from '@sveltejs/kit';
import { createAppBuildersError, rebuildableProductsWhere } from './common';
import { DatabaseReads } from '$lib/server/database';

export async function GET({ params, locals }) {
  locals.security.requireApiToken();

  const projectId = parseInt(params.id);
  const userId = locals.security.userId;

  // Count rebuildable products for this project + owner
  const productCount = await DatabaseReads.products.count({
    where: rebuildableProductsWhere(projectId, userId)
  });

  // at least one matching product
  const canRebuild = productCount > 0;

  if (!canRebuild) {
    return createAppBuildersError(400, 'Project does not meet rebuild conditions');
  }

  return json({ id: projectId, 'can-rebuild': canRebuild });
}

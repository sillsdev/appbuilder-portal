import { json } from '@sveltejs/kit';
import { createAppBuildersError, rebuildableProductsWhere } from '../common';
import { ProductActionType } from '$lib/products/index';
import { doProductAction } from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

export async function POST({ params, locals }) {
  // Validate API token and get user ID
  try {
    locals.security.requireApiToken();
  } catch {
    return createAppBuildersError(401, 'Login timed out');
  }
  const userId = locals.security.userId;

  const projectId = parseInt(params.id);

  // Fetch project and owner
  const project = await DatabaseReads.projects.findFirst({
    where: {
      Id: projectId,
      // Enforces ownership
      Owner: { Id: userId }
    },
    select: {
      Owner: { select: { Id: true } }
    }
  });

  if (!project) {
    return createAppBuildersError(404, `Project id=${projectId} not found or access denied`);
  }
  const rebuildableProducts = await DatabaseReads.products.findMany({
    where: rebuildableProductsWhere(projectId, userId),
    select: { Id: true }
  });

  if (rebuildableProducts.length === 0) {
    return createAppBuildersError(400, 'Project does not meet rebuild conditions');
  }

  // Trigger rebuild on each eligible product
  for (const product of rebuildableProducts) {
    await doProductAction(product.Id, ProductActionType.Rebuild);
  }

  return json({
    message: `Triggered rebuild for ${rebuildableProducts.length} product(s)`
  });
}

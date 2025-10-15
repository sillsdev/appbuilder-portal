import { json } from '@sveltejs/kit';
import { ProductActionType } from '$lib/products/index';
import { doProductAction } from '$lib/products/server';
import { DatabaseReads } from '$lib/server/database';

/** Wrapper function to return error messages for AppBuilders */
function createAppBuildersError(status: number, title: string) {
  return new Response(
    JSON.stringify({ errors: [{ title }] }),
    { status }
  );
}

export async function POST({ params, locals }) {
  // Validate API token and get user ID
  locals.security.requireApiToken();
  const userId = locals.security.userId;

  const projectId = parseInt(params.id);

  // Fetch project and owner
  const project = await DatabaseReads.projects.findUnique({
    where: { Id: projectId },
    select: {
      Owner: { select: { Id: true } }
    }
  });

  if (!project) {
    return createAppBuildersError(404, `Project id=${projectId} not found`);
  }

  // Check ownership
  const isOwner = userId === project.Owner.Id;

  // Fetch all products for this project
  const products = await DatabaseReads.products.findMany({
    where: { ProjectId: projectId },
    select: {
      Id: true,
      DatePublished: true,
      PublishLink: true,
      WorkflowInstance: { select: { Id: true } }
    }
  });

  // Find rebuildable products: published & no workflow in progress
  const rebuildableProducts = products.filter(
    (p) => p.DatePublished && p.PublishLink && !p.WorkflowInstance
  );

  const canRebuild = isOwner && rebuildableProducts.length > 0;

  if (!canRebuild) {
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

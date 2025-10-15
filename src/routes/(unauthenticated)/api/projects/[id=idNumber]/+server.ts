import { json } from '@sveltejs/kit';
import { DatabaseReads } from '$lib/server/database';

export async function GET({ params, locals }) {
  locals.security.requireApiToken();

  const projectId = parseInt(params.id);
  const userId = locals.security.userId;

  const project = await DatabaseReads.projects.findUnique({
    where: { Id: projectId },
    select: {
      Id: true,
      Owner: { select: { Id: true } },
      Products: {
        select: {
          Id: true,
          DatePublished: true,
          PublishLink: true,
          WorkflowInstance: { select: { Id: true } }
        }
      }
    }
  });

  if (!project) {
    return json({ error: `Project id=${projectId} not found` }, { status: 404 });
  }

  const isOwner = userId === project.Owner.Id;
  const rebuildableProducts = project.Products.filter(
    (p) => p.DatePublished && p.PublishLink && !p.WorkflowInstance
  );

  const canRebuild = isOwner && rebuildableProducts.length > 0;

  return json({ id: projectId, 'can-rebuild': canRebuild });
}

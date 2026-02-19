import { ProductTransitionType } from '../../prisma';
import { DatabaseWrites } from '../database';
import { DatabaseReads } from '../database/prisma';

export async function deleteWorkflow(productId: string) {
  const product = await DatabaseReads.products.findUnique({
    where: { Id: productId },
    select: {
      ProjectId: true,
      WorkflowInstance: { select: { WorkflowDefinition: { select: { Type: true } } } }
    }
  });
  if (product?.WorkflowInstance) {
    await DatabaseWrites.workflowInstances.delete(productId, product.ProjectId);
    await DatabaseWrites.productTransitions.create({
      data: {
        ProductId: productId,
        // This is how S1 does it. May want to change later
        AllowedUserNames: '',
        DateTransition: new Date(),
        TransitionType: ProductTransitionType.EndWorkflow,
        WorkflowType: product.WorkflowInstance.WorkflowDefinition.Type
      }
    });
  }
}

export async function markResolved(productId: string) {
  const product = await DatabaseReads.products.findFirst({
    where: { Id: productId },
    select: {
      ProductPublications: {
        select: {
          ProductId: true,
          BuildEngineReleaseId: true,
          PublishLink: true
        },
        orderBy: {
          DateUpdated: 'desc'
        },
        take: 1
      }
    }
  });
  if (product?.ProductPublications.length) {
    const resolved = new Date();
    const release = product.ProductPublications[0];
    await DatabaseWrites.productPublications.update({
      where: { ProductId_BuildEngineReleaseId: release },
      data: {
        DateResolved: resolved
      }
    });

    await DatabaseWrites.products.update(productId, {
      DatePublished: resolved,
      PublishLink: release.PublishLink ?? undefined
    });
  }
}

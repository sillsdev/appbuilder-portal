import { DatabaseWrites } from '../databaseProxy/index.js';
import prisma from '../databaseProxy/prisma.js';
import { ProductTransitionType } from '../public/prisma.js';

export async function deleteWorkflow(productId: string) {
  const product = await prisma.products.findUnique({
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

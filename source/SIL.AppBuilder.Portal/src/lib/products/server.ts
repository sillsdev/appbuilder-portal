import { BullMQ, DatabaseWrites, prisma, Queues, Workflow } from 'sil.appbuilder.portal.common';
import { ProductTransitionType, WorkflowType } from 'sil.appbuilder.portal.common/prisma';
import { ProductActionType } from '.';

export async function doProductAction(productId: string, action: ProductActionType) {
  const product = await prisma.products.findUnique({
    where: {
      Id: productId
    },
    select: {
      Id: true,
      ProjectId: true,
      ProductDefinition: {
        select: {
          RebuildWorkflow: {
            select: {
              Type: true,
              ProductType: true,
              WorkflowOptions: true
            }
          },
          RepublishWorkflow: {
            select: {
              Type: true,
              ProductType: true,
              WorkflowOptions: true
            }
          }
        }
      },
      WorkflowInstance: {
        select: {
          WorkflowDefinition: {
            select: { Type: true }
          }
        }
      }
    }
  });

  if (product) {
    switch (action) {
    case ProductActionType.Rebuild:
    case ProductActionType.Republish: {
      const flowType = action === 'rebuild' ? 'RebuildWorkflow' : 'RepublishWorkflow';
      if (product.ProductDefinition[flowType] && !product.WorkflowInstance) {
        await Workflow.create(productId, {
          productType: product.ProductDefinition[flowType].ProductType,
          options: new Set(product.ProductDefinition[flowType].WorkflowOptions),
          workflowType: product.ProductDefinition[flowType].Type
        });
      }
      break;
    }
    case ProductActionType.Cancel:
      if (
        product.WorkflowInstance?.WorkflowDefinition &&
          product.WorkflowInstance.WorkflowDefinition.Type !== WorkflowType.Startup
      ) {
        await Queues.UserTasks.add(
          `Delete UserTasks for canceled workflow (product #${productId})`,
          {
            type: BullMQ.JobType.UserTasks_Modify,
            scope: 'Product',
            productId,
            operation: {
              type: BullMQ.UserTasks.OpType.Delete
            }
          }
        );
        await DatabaseWrites.productTransitions.create({
          data: {
            ProductId: productId,
            // This is how S1 does it. May want to change later
            AllowedUserNames: '',
            DateTransition: new Date(),
            TransitionType: ProductTransitionType.CancelWorkflow,
            WorkflowType: product.WorkflowInstance.WorkflowDefinition.Type
          }
        });
        await DatabaseWrites.workflowInstances.delete(productId, product.ProjectId);
      }
      break;
    }
  }
}

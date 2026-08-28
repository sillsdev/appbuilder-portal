import { SpanStatusCode, trace } from '@opentelemetry/api';
import { ProductTransitionType } from '../../prisma';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseWrites } from '../database';
import { DatabaseReads } from '../database/prisma';
import { stringifyError } from '$lib/utils';
import type { WorkflowState } from '$lib/workflowTypes';

export async function deleteWorkflow(productId: string, status: WorkflowState) {
  const product = await DatabaseReads.products.findUnique({
    where: { Id: productId },
    select: {
      ProjectId: true,
      WorkflowInstance: { select: { WorkflowDefinition: { select: { Type: true } } } }
    }
  });
  if (product?.WorkflowInstance) {
    await DatabaseWrites.workflowInstances.delete(productId, product.ProjectId, status);
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
  try {
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
            DateCreated: 'desc'
          },
          take: 1
        }
      }
    });
    if (product?.ProductPublications.length) {
      const resolved = new Date();
      const release = product.ProductPublications[0];
      await DatabaseWrites.productPublications.update(
        release.ProductId,
        release.BuildEngineReleaseId,
        {
          DateResolved: resolved,
          Success: true
        }
      );

      await DatabaseWrites.products.update(productId, {
        DatePublished: resolved,
        PublishLink: release.PublishLink ?? undefined
      });
    }
  } catch (err) {
    const exception = stringifyError(err);
    const span = trace.getActiveSpan();
    span?.recordException(exception);
    span?.setStatus({
      code: SpanStatusCode.ERROR,
      message: `Failed to mark Product #${productId} publication as resolved`
    });
  }
}

export async function notifyAutoPublishOwner(productId: string) {
  try {
    const product = await DatabaseReads.products.findUnique({
      where: { Id: productId },
      select: {
        ProductDefinition: {
          select: {
            Name: true
          }
        },
        Project: {
          select: {
            Name: true,
            OwnerId: true
          }
        }
      }
    });
    if (!product?.Project.OwnerId) return;
    await getQueues().Emails.add(`Notify Owner of Auto Publish for Product #${productId}`, {
      type: BullMQ.JobType.Email_SendNotificationToUser,
      userId: product.Project.OwnerId,
      messageKey: 'autoPublishOnRebuildCompleted',
      messageProperties: {
        projectName: product.Project.Name ?? '',
        productName: product.ProductDefinition.Name ?? ''
      }
    });
  } catch (err) {
    const exception = stringifyError(err);
    const span = trace.getActiveSpan();
    span?.recordException(exception);
    span?.setStatus({
      code: SpanStatusCode.ERROR,
      message: `Failed to notify owner of auto publish for Product #${productId}`
    });
  }
}

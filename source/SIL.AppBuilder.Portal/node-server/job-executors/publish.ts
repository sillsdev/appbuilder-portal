import {
  BullMQ,
  prisma,
  DatabaseWrites,
  BuildEngine,
  Workflow,
  scriptoriaQueue
} from 'sil.appbuilder.portal.common';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';
import { WorkflowAction } from 'sil.appbuilder.portal.common/workflow';

// TODO: What would be a meaningful return?
export class Product extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Publish_Product> {
  async execute(job: Job<BullMQ.Publish.Product, number, string>): Promise<number> {
    const productData = await prisma.products.findUnique({
      where: {
        Id: job.data.productId
      },
      select: {
        Project: {
          select: {
            OrganizationId: true
          }
        },
        WorkflowJobId: true,
        WorkflowBuildId: true
      }
    });
    job.updateProgress(25);
    const response = await BuildEngine.Requests.createRelease(
      productData.Project.OrganizationId,
      productData.WorkflowJobId,
      productData.WorkflowBuildId,
      {
        channel: job.data.channel,
        targets: job.data.targets,
        environment: job.data.environment
      }
    );
    job.updateProgress(50);
    if (response.responseType === 'error') {
      const flow = await Workflow.restore(job.data.productId);
      // TODO: How best to notify of failure?
      flow.send({ type: WorkflowAction.Publish_Failed, userId: null, comment: response.message });
      job.updateProgress(100);
      return 0;
    } else {
      await DatabaseWrites.products.update(job.data.productId, {
        WorkflowPublishId: response.id,
        DateUpdated: new Date()
      });
      job.updateProgress(75);

      await scriptoriaQueue.add(
        `Check status of Publish #${response.id}`,
        {
          type: BullMQ.ScriptoriaJobType.Publish_Check,
          productId: job.data.productId,
          organizationId: productData.Project.OrganizationId,
          jobId: productData.WorkflowJobId,
          buildId: productData.WorkflowBuildId,
          releaseId: response.id
        },
        {
          repeat: {
            pattern: '*/1 * * * *' // every minute
          }
        }
      );
      job.updateProgress(100);

      return response.id;
    }
  }
}

export class Check extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Publish_Check> {
  async execute(job: Job<BullMQ.Publish.Check, number, string>): Promise<number> {
    const response = await BuildEngine.Requests.getRelease(
      job.data.organizationId,
      job.data.jobId,
      job.data.buildId,
      job.data.releaseId
    );
    job.updateProgress(50);
    if (response.responseType === 'error') {
      throw new Error(response.message);
    } else {
      // TODO: what does the 'expired' status mean?
      if (response.status === 'completed' || response.status === 'expired') {
        await scriptoriaQueue.removeRepeatableByKey(job.repeatJobKey);
        if (response.error) {
          job.log(response.error);
        }
        const flow = await Workflow.restore(job.data.productId);
        if (response.result === 'SUCCESS') {
          flow.send({ type: WorkflowAction.Publish_Completed, userId: null });
        } else {
          flow.send({ type: WorkflowAction.Publish_Failed, userId: null, comment: response.error });
        }
        job.updateProgress(100);
        return response.id;
      }
      job.updateProgress(100);
      return 0;
    }
  }
}

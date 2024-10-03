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
export class CreateProduct extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.CreateProduct> {
  async execute(job: Job<BullMQ.CreateProductJob, number, string>): Promise<number> {
    const productData = await prisma.products.findUnique({
      where: {
        Id: job.data.productId
      },
      select: {
        Project: {
          select: {
            ApplicationType: {
              select: {
                Name: true
              }
            },
            WorkflowProjectUrl: true,
            OrganizationId: true
          }
        },
        Store: {
          select: {
            Name: true
          }
        }
      }
    });
    job.updateProgress(25);
    const response = await BuildEngine.Requests.createJob(productData.Project.OrganizationId, {
      request_id: job.data.productId,
      git_url: productData.Project.WorkflowProjectUrl,
      app_id: productData.Project.ApplicationType.Name,
      publisher_id: productData.Store.Name
    });
    job.updateProgress(50);
    if (response.responseType === 'error') {
      // TODO: What do I do here? Wait some period of time and retry?
      job.log(response.message);
      throw new Error(response.message);
    } else {
      await DatabaseWrites.products.update(job.data.productId, {
        WorkflowJobId: response.id,
        DateUpdated: new Date().toString()
      });
      job.updateProgress(75);
      const flow = await Workflow.restore(job.data.productId);

      flow.send({ type: WorkflowAction.Product_Created, userId: null });

      return response.id;
    }
  }
}

// TODO: What would be a meaningful return?
export class BuildProduct extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.BuildProduct> {
  async execute(job: Job<BullMQ.BuildProductJob, number, string>): Promise<number> {
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
        WorkflowJobId: true
      }
    });
    job.updateProgress(25);
    const response = await BuildEngine.Requests.createBuild(
      productData.Project.OrganizationId,
      productData.WorkflowJobId,
      {
        targets: job.data.targets ?? 'apk play-listing',
        environment: job.data.environment
      }
    );
    job.updateProgress(50);
    if (response.responseType === 'error') {
      const flow = await Workflow.restore(job.data.productId);
      // TODO: How best to notify of failure?
      flow.send({ type: WorkflowAction.Build_Failed, userId: null, comment: response.message });
      return 0;
    } else {
      await DatabaseWrites.products.update(job.data.productId, {
        WorkflowBuildId: response.id,
        DateUpdated: new Date().toString()
      });
      job.updateProgress(75);
      
      await scriptoriaQueue.add(`Check status of Build #${response.id}`, {
        type: BullMQ.ScriptoriaJobType.CheckBuildProduct,
        productId: job.data.productId,
        organizationId: productData.Project.OrganizationId,
        jobId: productData.WorkflowJobId,
        buildId: response.id
      },
      {
        repeat: {
          pattern: '*/1 * * * *' // every minute
        }
      });

      job.updateProgress(100);

      return response.id;
    }
  }
}

export class CheckBuildProduct extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.CheckBuildProduct> {
  async execute(job: Job<BullMQ.CheckBuildProductJob, number, string>): Promise<number> {
    const response = await BuildEngine.Requests.getBuild(
      job.data.organizationId,
      job.data.jobId,
      job.data.buildId
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
          flow.send({ type: WorkflowAction.Build_Successful, userId: null });
        } else {
          flow.send({ type: WorkflowAction.Build_Failed, userId: null, comment: response.error });
        }
        job.updateProgress(100);
        return response.id;
      }
      job.updateProgress(100);
      return 0;
    }
  }
}

// TODO: What would be a meaningful return?
export class PublishProduct extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.PublishProduct> {
  async execute(job: Job<BullMQ.PublishProductJob, number, string>): Promise<number> {
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
      return 0;
    } else {
      await DatabaseWrites.products.update(job.data.productId, {
        WorkflowPublishId: response.id,
        DateUpdated: new Date().toString()
      });
      job.updateProgress(75);

      await scriptoriaQueue.add(`Check status of Publish #${response.id}`, {
        type: BullMQ.ScriptoriaJobType.CheckPublishProduct,
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
      });
      job.updateProgress(100);

      return response.id;
    }
  }
}

export class CheckPublishProduct extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.CheckPublishProduct> {
  async execute(job: Job<BullMQ.CheckPublishProductJob, number, string>): Promise<number> {
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

import {
  BullMQ,
  prisma,
  DatabaseWrites,
  BuildEngine,
  Workflow
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
    const response = await BuildEngine.Requests.createJob(productData.Project.OrganizationId, {
      request_id: job.data.productId,
      git_url: productData.Project.WorkflowProjectUrl,
      app_id: productData.Project.ApplicationType.Name,
      publisher_id: productData.Store.Name
    });

    if (response.responseType === 'error') {
      // TODO: What do I do here? Wait some period of time and retry?
      return 0;
    } else {
      await DatabaseWrites.products.update(job.data.productId, {
        WorkflowJobId: response.id,
        DateUpdated: new Date().toString()
      });

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

    const response = await BuildEngine.Requests.createBuild(
      productData.Project.OrganizationId,
      productData.WorkflowJobId,
      {
        targets: job.data.targets ?? 'apk play-listing',
        environment: job.data.environment
      }
    );

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

      // TODO: Recurring job to check build status?

      return response.id;
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

      // TODO: Recurring job to check publish status?

      return response.id;
    }
  }
}

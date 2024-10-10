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

export class Create extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Product_Create> {
  async execute(job: Job<BullMQ.Product.Create, number, string>): Promise<number> {
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

export class Delete extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Product_Delete> {
  async execute(job: Job<BullMQ.Product.Delete, number, string>): Promise<number> {
    const response = await BuildEngine.Requests.deleteJob(
      job.data.organizationId,
      job.data.workflowJobId
    );
    job.updateProgress(50);
    if (response.responseType === 'error') {
      job.log(response.message);
      throw new Error(response.message);
    } else {
      job.updateProgress(100);
      return response.status;
    }
  }
}

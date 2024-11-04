import { Job } from 'bullmq';
import {
  BuildEngine,
  BullMQ,
  DatabaseWrites,
  prisma,
  Workflow
} from 'sil.appbuilder.portal.common';
import { WorkflowAction } from 'sil.appbuilder.portal.common/workflow';

export async function create(job: Job<BullMQ.Product.Create>): Promise<unknown> {
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
  const response = await BuildEngine.Requests.createJob(
    { type: 'query', organizationId: productData.Project.OrganizationId },
    {
      request_id: job.data.productId,
      git_url: productData.Project.WorkflowProjectUrl,
      app_id: productData.Project.ApplicationType.Name,
      publisher_id: productData.Store.Name
    }
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    // TODO: What do I do here? Wait some period of time and retry?
    job.log(response.message);
    throw new Error(response.message);
  } else {
    await DatabaseWrites.products.update(job.data.productId, {
      WorkflowJobId: response.id
    });
    job.updateProgress(75);
    const flow = await Workflow.restore(job.data.productId);

    flow.send({ type: WorkflowAction.Product_Created, userId: null });

    job.updateProgress(100);
    return response;
  }
}

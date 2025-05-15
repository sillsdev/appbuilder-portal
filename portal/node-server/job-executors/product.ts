import { Job } from 'bullmq';
import {
  BuildEngine,
  BullMQ,
  DatabaseWrites,
  prisma,
  Queues,
  Workflow
} from 'sil.appbuilder.portal.common';
import {
  ENVKeys,
  WorkflowAction,
  WorkflowInstanceContext
} from 'sil.appbuilder.portal.common/workflow';
import { Retry5e5 } from '../../common/bullmq/types.js';

export async function create(job: Job<BullMQ.Product.Create>): Promise<unknown> {
  const productData = await prisma.products.findUnique({
    where: {
      Id: job.data.productId
    },
    select: {
      Project: {
        select: {
          Id: true,
          Name: true,
          OwnerId: true,
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
      },
      ProductDefinition: {
        select: {
          Name: true
        }
      }
    }
  });
  if (!productData) {
    return await notifyNotFound(job.data.productId);
  }
  if (!productData.Project.WorkflowProjectUrl) {
    if (job.attemptsMade >= (job.opts.attempts ?? Retry5e5.attempts)) {
      await notifyProjectUrlNotSet(
        job.data.productId,
        productData.Project.Id,
        productData.Project.Name,
        productData.ProductDefinition.Name
      );
    }
    throw new Error('Project.WorkflowProjectUrl not set!');
  }
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
    job.log(response.message);
    if (job.attemptsMade >= job.opts.attempts) {
      if (response.code === BuildEngine.Types.EndpointUnavailable) {
        await notifyConnectionFailed(
          job.data.productId,
          productData.Project.Id,
          productData.Project.Name,
          productData.ProductDefinition.Name
        );
      } else {
        await notifyFailed(
          job.data.productId,
          productData.Project.Id,
          productData.Project.OrganizationId,
          productData.Project.Name,
          productData.ProductDefinition.Name
        );
      }
    }
    throw new Error(response.message);
  } else {
    await DatabaseWrites.products.update(job.data.productId, {
      WorkflowJobId: response.id
    });
    job.updateProgress(75);

    await notifyCreated(
      job.data.productId,
      productData.Project.OwnerId,
      productData.Project.Name,
      productData.ProductDefinition.Name
    );
    const flow = await Workflow.restore(job.data.productId);

    flow?.send({ type: WorkflowAction.Product_Created, userId: null });

    job.updateProgress(100);
    return response;
  }
}

// This shouldn't need any notifications
export async function deleteProduct(job: Job<BullMQ.Product.Delete>): Promise<unknown> {
  const response = await BuildEngine.Requests.deleteJob(
    { type: 'query', organizationId: job.data.organizationId },
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

// This shouldn't need any notifications
export async function getVersionCode(job: Job<BullMQ.Product.GetVersionCode>): Promise<unknown> {
  let versionCode = 0;
  const product = await prisma.products.findUnique({
    where: {
      Id: job.data.productId
    },
    select: {
      WorkflowBuildId: true,
      WorkflowJobId: true,
      Project: {
        select: {
          Organization: {
            select: {
              BuildEngineUrl: true,
              BuildEngineApiAccessToken: true
            }
          }
        }
      }
    }
  });
  job.updateProgress(30);
  if (product?.WorkflowBuildId && product?.WorkflowJobId) {
    const productBuild = await prisma.productBuilds.findFirst({
      where: {
        ProductId: job.data.productId,
        BuildId: product.WorkflowBuildId
      },
      select: {
        Id: true
      }
    });
    if (!productBuild) {
      return 0;
    }
    job.updateProgress(45);
    const versionCodeArtifact = await prisma.productArtifacts.findFirst({
      where: {
        ProductId: job.data.productId,
        ProductBuildId: productBuild.Id,
        ArtifactType: 'version'
      },
      select: {
        Url: true
      }
    });
    if (!versionCodeArtifact) {
      return 0;
    }
    job.updateProgress(60);
    const version = JSON.parse(await fetch(versionCodeArtifact.Url).then((r) => r.text()));
    if (version['versionCode'] !== undefined) {
      versionCode = parseInt(version['versionCode']);
    }
    job.updateProgress(75);
  }
  if (versionCode) {
    const instance = await prisma.workflowInstances.findUnique({
      where: {
        ProductId: job.data.productId
      },
      select: {
        Context: true
      }
    });
    const ctx: WorkflowInstanceContext = JSON.parse(instance.Context);
    job.updateProgress(90);
    // Use update here so this job doesn't inadvertently create a workflowInstance
    await DatabaseWrites.workflowInstances.update(job.data.productId, {
      Context: JSON.stringify({
        ...ctx,
        environment: {
          ...ctx.environment,
          [ENVKeys.PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID]: '' + product.WorkflowBuildId,
          [ENVKeys.PUBLISH_GOOGLE_PLAY_UPLOADED_VERSION_CODE]: '' + versionCode
        }
      } as WorkflowInstanceContext)
    });
  }
  job.updateProgress(100);
  return versionCode;
}

async function notifyConnectionFailed(
  productId: string,
  projectId: number,
  projectName: string,
  productName: string
) {
  return Queues.Emails.add(`Notify Owner/Admins of Product #${productId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'productFailedUnableToConnect',
    messageProperties: {
      projectName,
      productName
    }
  });
}
async function notifyProjectUrlNotSet(
  productId: string,
  projectId: number,
  projectName: string,
  productName: string
) {
  return Queues.Emails.add(`Notify Owner/Admins of Product #${productId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'productProjectUrlNotSet',
    messageProperties: {
      projectName,
      productName
    }
  });
}
async function notifyCreated(
  productId: string,
  userId: number,
  projectName: string,
  productName: string
) {
  return Queues.Emails.add(`Notify Owner of Product #${productId} Creation Success`, {
    type: BullMQ.JobType.Email_SendNotificationToUser,
    userId,
    messageKey: 'productCreatedSuccessfully',
    messageProperties: {
      projectName,
      productName
    }
  });
}
async function notifyFailed(
  productId: string,
  projectId: number,
  organizationId: number,
  projectName: string,
  productName: string
) {
  const endpoint = await BuildEngine.Requests.getURLandToken(organizationId);
  const buildEngineUrl = endpoint + '/job-admin';
  return Queues.Emails.add(`Notify Owner/Admins of Product #${productId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'productCreationFailed',
    messageProperties: {
      projectName,
      productName,
      buildEngineUrl
    },
    link: buildEngineUrl
  });
}
async function notifyNotFound(productId: string) {
  await Queues.Emails.add(`Notify SuperAdmins of Failure to Find Product #${productId}`, {
    type: BullMQ.JobType.Email_NotifySuperAdminsGeneric,
    messageKey: 'productRecordNotFound',
    messageProperties: {
      productId
    }
  });
  return { message: 'Product Not Found' };
}

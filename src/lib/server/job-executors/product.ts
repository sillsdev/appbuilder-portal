import type { Job } from 'bullmq';
import { BuildEngine } from '../build-engine-api';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import { Workflow } from '../workflow';
import type { WorkflowInstanceContext } from '$lib/workflowTypes';
import { ENVKeys, WorkflowAction } from '$lib/workflowTypes';

export async function create(job: Job<BullMQ.Product.Create>): Promise<unknown> {
  const productData = await DatabaseReads.products.findUnique({
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
          RepositoryUrl: true,
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
  if (!productData.Project.RepositoryUrl) {
    if (job.attemptsStarted >= (job.opts.attempts ?? 0)) {
      await notifyProjectUrlNotSet(
        job.data.productId,
        productData.Project.Id,
        productData.Project.Name!,
        productData.ProductDefinition.Name!,
        job.data.transition
      );
    }
    throw new Error('Project.RepositoryUrl not set!');
  }
  job.updateProgress(25);
  const response = await BuildEngine.Requests.createJob(
    { type: 'query', organizationId: productData.Project.OrganizationId },
    {
      request_id: job.data.productId,
      git_url: productData.Project.RepositoryUrl,
      app_id: productData.Project.ApplicationType.Name!,
      publisher_id: productData.Store!.Name!
    }
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    job.log(response.message);
    if (job.attemptsStarted >= (job.opts.attempts ?? 0)) {
      if (response.code === BuildEngine.Types.EndpointUnavailable) {
        await notifyConnectionFailed(
          job.data.productId,
          productData.Project.Id,
          productData.Project.Name!,
          productData.ProductDefinition.Name!,
          job.data.transition
        );
      } else {
        await notifyFailed(
          job.data.productId,
          productData.Project.Id,
          productData.Project.OrganizationId,
          productData.Project.Name!,
          productData.ProductDefinition.Name!,
          job.data.transition
        );
      }
    }
    throw new Error(response.message);
  } else {
    await DatabaseWrites.products.update(job.data.productId, {
      BuildEngineJobId: response.id
    });
    job.updateProgress(75);

    await notifyCreated(
      job.data.productId,
      productData.Project.OwnerId,
      productData.Project.Name!,
      productData.ProductDefinition.Name!,
      job.data.transition
    );
    const flow = await Workflow.restore(job.data.productId);

    flow?.send({ type: WorkflowAction.Product_Created, userId: null });

    job.updateProgress(100);
    return response;
  }
}

// This shouldn't need any notifications
export async function deleteProduct(job: Job<BullMQ.Product.Delete>): Promise<unknown> {
  if (job.data.buildEngineJobId > 0) {
    const response = await BuildEngine.Requests.deleteJob(
      { type: 'query', organizationId: job.data.organizationId },
      job.data.buildEngineJobId
    );
    job.updateProgress(50);
    if (response.responseType === 'error') {
      job.log(response.message);
      throw new Error(response.message);
    } else {
      job.updateProgress(100);
      return response.status;
    }
  } else {
    job.updateProgress(100);
    return 'No Job to delete from BuildEngine (WorkflowJobId === 0)';
  }
}

// This shouldn't need any notifications
export async function getVersionCode(job: Job<BullMQ.Product.GetVersionCode>): Promise<unknown> {
  let versionCode = 0;
  const product = await DatabaseReads.products.findUniqueOrThrow({
    where: {
      Id: job.data.productId
    },
    select: {
      BuildEngineBuildId: true,
      BuildEngineJobId: true,
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
  if (product?.BuildEngineBuildId && product?.BuildEngineJobId) {
    const productBuild = await DatabaseReads.productBuilds.findFirst({
      where: {
        ProductId: job.data.productId,
        BuildId: product.BuildEngineBuildId
      },
      select: {
        Id: true
      }
    });
    if (!productBuild) {
      return 0;
    }
    job.updateProgress(45);
    const versionCodeArtifact = await DatabaseReads.productArtifacts.findFirstOrThrow({
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
    const version = JSON.parse(await fetch(versionCodeArtifact.Url!).then((r) => r.text()));
    if (version['versionCode'] !== undefined) {
      versionCode = parseInt(version['versionCode']);
    }
    job.updateProgress(75);
  }
  if (versionCode) {
    const instance = await DatabaseReads.workflowInstances.findUniqueOrThrow({
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
          [ENVKeys.PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID]: '' + product.BuildEngineBuildId,
          [ENVKeys.PUBLISH_GOOGLE_PLAY_UPLOADED_VERSION_CODE]: '' + versionCode
        }
      } as WorkflowInstanceContext)
    });
  }
  job.updateProgress(100);
  return versionCode;
}

export async function createLocal(job: Job<BullMQ.Product.CreateLocal>): Promise<unknown> {
  try {
    const productId = await DatabaseWrites.products.create({
      ProjectId: job.data.projectId,
      ProductDefinitionId: job.data.productDefinitionId,
      StoreId: job.data.storeId,
      BuildEngineBuildId: 0,
      BuildEngineJobId: 0,
      BuildEngineReleaseId: 0
    });
    if (!productId) return false;

    const flowDefinition = (
      await DatabaseReads.productDefinitions.findUnique({
        where: {
          Id: job.data.productDefinitionId
        },
        select: {
          Workflow: {
            select: {
              Id: true,
              Type: true,
              ProductType: true,
              WorkflowOptions: true
            }
          }
        }
      })
    )?.Workflow;

    if (flowDefinition) {
      await Workflow.create(productId, {
        productType: flowDefinition.ProductType,
        options: new Set(flowDefinition.WorkflowOptions),
        workflowType: flowDefinition.Type
      });
    }

    return productId;
  } catch (err) {
    await job.log(err instanceof Error ? err.message : String(err));
    return false;
  }
}

async function notifyConnectionFailed(
  productId: string,
  projectId: number,
  projectName: string,
  productName: string,
  transition?: number
) {
  return getQueues().Emails.add(`Notify Owner/Admins of Product #${productId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'productFailedUnableToConnect',
    messageProperties: {
      projectName,
      productName
    },
    transition
  });
}
async function notifyProjectUrlNotSet(
  productId: string,
  projectId: number,
  projectName: string,
  productName: string,
  transition?: number
) {
  return getQueues().Emails.add(`Notify Owner/Admins of Product #${productId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'productProjectUrlNotSet',
    messageProperties: {
      projectName,
      productName
    },
    transition
  });
}
async function notifyCreated(
  productId: string,
  userId: number,
  projectName: string,
  productName: string,
  transition?: number
) {
  return getQueues().Emails.add(`Notify Owner of Product #${productId} Creation Success`, {
    type: BullMQ.JobType.Email_SendNotificationToUser,
    userId,
    messageKey: 'productCreatedSuccessfully',
    messageProperties: {
      projectName,
      productName
    },
    transition
  });
}
async function notifyFailed(
  productId: string,
  projectId: number,
  organizationId: number,
  projectName: string,
  productName: string,
  transition?: number
) {
  const endpoint = (await BuildEngine.Requests.getURLandToken(organizationId)).url;
  const buildEngineUrl = endpoint + '/job-admin';
  return getQueues().Emails.add(`Notify Owner/Admins of Product #${productId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'productCreationFailed',
    messageProperties: {
      projectName,
      productName,
      buildEngineUrl
    },
    link: buildEngineUrl,
    transition
  });
}
async function notifyNotFound(productId: string) {
  await getQueues().Emails.add(`Notify SuperAdmins of Failure to Find Product #${productId}`, {
    type: BullMQ.JobType.Email_NotifySuperAdminsLowPriority,
    messageKey: 'productRecordNotFound',
    messageProperties: {
      productId
    }
  });
  return { message: 'Product Not Found' };
}

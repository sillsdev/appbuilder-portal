import type { Prisma } from '@prisma/client';
import { Job } from 'bullmq';
import {
  BuildEngine,
  BullMQ,
  DatabaseWrites,
  prisma,
  Queues,
  Workflow
} from 'sil.appbuilder.portal.common';
import { WorkflowAction } from 'sil.appbuilder.portal.common/workflow';
import {
  addProductPropertiesToEnvironment,
  getWorkflowParameters
} from './common.build-publish.js';

export async function product(job: Job<BullMQ.Publish.Product>): Promise<unknown> {
  const productData = await prisma.products.findUnique({
    where: {
      Id: job.data.productId
    },
    select: {
      Project: {
        select: {
          Id: true,
          Name: true,
          OrganizationId: true
        }
      },
      WorkflowJobId: true,
      WorkflowBuildId: true,
      WorkflowInstance: {
        select: {
          Id: true
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
    return await notifyProductNotFound(job.data.productId);
  }
  job.updateProgress(10);
  const productBuild = await prisma.productBuilds.findFirst({
    where: {
      BuildId: productData.WorkflowBuildId
    },
    select: {
      Id: true
    }
  });
  if (!productData.WorkflowBuildId || !productBuild) {
    // ISSUE: #1100 I don't like this, but it's the most appropriate message currently available
    await notifyProductNotFound(job.data.productId);
    const flow = await Workflow.restore(job.data.productId);
    flow?.send({
      type: WorkflowAction.Publish_Failed,
      userId: null,
      comment: 'Product does not have a ProductBuild available.'
    });
    job.updateProgress(100);
    return productData;
  }
  job.updateProgress(15);
  if (productData.WorkflowInstance) {
    await DatabaseWrites.products.update(job.data.productId, {
      WorkflowPublishId: 0
    });
    job.updateProgress(20);
    const params = await getWorkflowParameters(productData.WorkflowInstance.Id, 'publish');
    const channel = params['channel'] ?? job.data.defaultChannel;
    job.updateProgress(30);
    const env = await addProductPropertiesToEnvironment(job.data.productId);
    job.updateProgress(40);
    const response = await BuildEngine.Requests.createRelease(
      { type: 'query', organizationId: productData.Project.OrganizationId },
      productData.WorkflowJobId,
      productData.WorkflowBuildId,
      {
        channel: channel,
        targets: params['targets'] ?? job.data.defaultTargets,
        environment: { ...env, ...params.environment, ...job.data.environment }
      }
    );
    job.updateProgress(50);
    const isError = response.responseType === 'error';
    if (isError || response.result !== 'SUCCESS') {
      const message = isError ? response.message : response.error;
      job.log(message);
      // if final retry
      if (job.attemptsMade >= job.opts.attempts) {
        if (isError && response.code === BuildEngine.Types.EndpointUnavailable) {
          await notifyConnectionFailed(
            job.data.productId,
            productData.Project.Id,
            productData.Project.Name,
            productData.ProductDefinition.Name
          );
        } else {
          await notifyUnableToCreate(
            job.data.productId,
            productData.Project.Id,
            productData.Project.Name,
            productData.ProductDefinition.Name
          );
        }
        const flow = await Workflow.restore(job.data.productId);
        flow?.send({
          type: WorkflowAction.Publish_Failed,
          userId: null,
          comment: message
        });
      }
      throw new Error(message);
    } else {
      await DatabaseWrites.products.update(job.data.productId, {
        WorkflowPublishId: response.id
      });
      job.updateProgress(65);

      const pub = await DatabaseWrites.productPublications.create({
        data: {
          ProductId: job.data.productId,
          ProductBuildId: productBuild.Id,
          ReleaseId: response.id,
          Channel: channel
        }
      });

      job.updateProgress(85);

      await Queues.RemotePolling.add(
        `Check status of Publish #${response.id}`,
        {
          type: BullMQ.JobType.Publish_Check,
          productId: job.data.productId,
          organizationId: productData.Project.OrganizationId,
          jobId: productData.WorkflowJobId,
          buildId: productData.WorkflowBuildId,
          releaseId: response.id,
          publicationId: pub.Id
        },
        BullMQ.RepeatEveryMinute
      );
    }
    job.updateProgress(100);
    return {
      response: {
        ...response,
        environment: JSON.parse(response['environment'] ?? '{}')
      },
      params,
      env
    };
  } else {
    job.log('No WorkflowInstance found. Workflow cancelled?');
    job.updateProgress(100);
    return { productData };
  }
}

export async function check(job: Job<BullMQ.Publish.Check>): Promise<unknown> {
  const product = await prisma.products.findFirst({
    where: {
      WorkflowJobId: job.data.jobId,
      WorkflowBuildId: job.data.buildId,
      WorkflowPublishId: job.data.releaseId
    },
    select: {
      WorkflowInstance: {
        select: {
          Id: true
        }
      }
    }
  });
  if (!product.WorkflowInstance) {
    await Queues.RemotePolling.removeRepeatableByKey(job.repeatJobKey);
    job.log('No WorkflowInstance found. Workflow cancelled?');
    if (!product) {
      return await notifyProductNotFound(job.data.productId);
    }
    job.updateProgress(100);
    return { product };
  }
  job.updateProgress(25);
  const response = await BuildEngine.Requests.getRelease(
    { type: 'query', organizationId: job.data.organizationId },
    job.data.jobId,
    job.data.buildId,
    job.data.releaseId
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    throw new Error(response.message);
  } else {
    if (response.status === 'completed') {
      await Queues.RemotePolling.removeRepeatableByKey(job.repeatJobKey);
      await Queues.Publishing.add(
        `PostProcess Release #${job.data.releaseId} for Product #${job.data.productId}`,
        {
          type: BullMQ.JobType.Publish_PostProcess,
          productId: job.data.productId,
          publicationId: job.data.publicationId,
          release: response
        }
      );
    }
    job.updateProgress(100);
    return {
      ...response,
      environment: JSON.parse(response['environment'] ?? '{}')
    };
  }
}

export async function postProcess(job: Job<BullMQ.Publish.PostProcess>): Promise<unknown> {
  const product = await prisma.products.findUnique({
    where: { Id: job.data.productId },
    select: {
      WorkflowJobId: true,
      WorkflowBuildId: true,
      WorkflowPublishId: true,
      ProductDefinition: {
        select: {
          Name: true
        }
      },
      Project: {
        select: {
          Id: true,
          Name: true,
          OwnerId: true,
          WorkflowAppProjectUrl: true,
          OrganizationId: true
        }
      }
    }
  });
  if (!product) {
    return await notifyProductNotFound(job.data.productId);
  }
  if (job.data.release.error) {
    job.log(job.data.release.error);
  }
  let packageName: string | undefined = undefined;
  const flow = await Workflow.restore(job.data.productId);
  job.updateProgress(25);
  if (flow) {
    if (job.data.release.result === 'SUCCESS') {
      const publishUrlFile = job.data.release.artifacts['publishUrl'];
      await DatabaseWrites.products.update(job.data.productId, {
        DatePublished: new Date(),
        PublishLink: publishUrlFile
          ? ((await fetch(publishUrlFile).then((r) => r.text()))?.trim() ?? undefined)
          : undefined
      });
      await notifyCompleted(
        job.data.publicationId,
        job.data.productId,
        product.Project.OwnerId,
        product.Project.Name,
        product.ProductDefinition.Name
      );
      flow.send({ type: WorkflowAction.Publish_Completed, userId: null });
      const packageFile = await prisma.productPublications.findUnique({
        where: {
          Id: job.data.publicationId
        },
        select: {
          ProductBuild: {
            select: {
              ProductArtifacts: {
                where: {
                  ArtifactType: 'package_name'
                },
                select: {
                  Url: true
                },
                take: 1
              }
            }
          }
        }
      });
      if (packageFile?.ProductBuild.ProductArtifacts[0]) {
        packageName = await fetch(packageFile.ProductBuild.ProductArtifacts[0].Url).then((r) =>
          r.text()
        );
      }
    } else {
      await notifyFailed(job.data.publicationId, job.data.productId, product, job.data.release);
      flow.send({
        type: WorkflowAction.Publish_Failed,
        userId: null,
        comment: `system.publish-failed,${job.data.release.artifacts['consoleText'] ?? ''}`
      });
    }
  }
  job.updateProgress(75);
  const publication = await DatabaseWrites.productPublications.update({
    where: {
      Id: job.data.publicationId
    },
    data: {
      Success: job.data.release.result === 'SUCCESS',
      LogUrl: job.data.release.consoleText,
      Package: packageName?.trim()
    }
  });
  job.updateProgress(100);
  return { publication };
}

async function notifyConnectionFailed(
  productId: string,
  projectId: number,
  projectName: string,
  productName: string
) {
  return Queues.Emails.add(
    `Notify Owner/Admins of Failure to Create Release for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId,
      messageKey: 'releaseFailedUnableToConnect',
      messageProperties: {
        projectName,
        productName
      }
    }
  );
}
async function notifyUnableToCreate(
  productId: string,
  projectId: number,
  projectName: string,
  productName: string
) {
  return Queues.Emails.add(
    `Notify Owner/Admins of Failure to Create Release for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId,
      messageKey: 'releaseFailedUnableToCreate',
      messageProperties: {
        projectName,
        productName
      }
    }
  );
}
async function notifyCompleted(
  publicationId: number,
  productId: string,
  userId: number,
  projectName: string,
  productName: string
) {
  return Queues.Emails.add(
    `Notify Owner of Successful Completion of Release #${publicationId} for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToUser,
      userId,
      messageKey: 'releaseCompletedSuccessfully',
      messageProperties: {
        projectName,
        productName
      }
    }
  );
}
async function notifyFailed(
  publicationId: number,
  productId: string,
  product: Prisma.ProductsGetPayload<{
    select: {
      WorkflowBuildId: true;
      WorkflowJobId: true;
      WorkflowPublishId: true;
      ProductDefinition: {
        select: { Name: true };
      };
      Project: {
        select: {
          Id: true;
          Name: true;
          OrganizationId: true;
          WorkflowAppProjectUrl: true;
        };
      };
    };
  }>,
  release: BuildEngine.Types.ReleaseResponse
) {
  const endpoint = await BuildEngine.Requests.getURLandToken(product.Project.OrganizationId);
  return Queues.Emails.add(
    `Notify Owner/Admins of Failure to Create Release #${publicationId} for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId: product.Project.Id,
      messageKey: 'releaseFailed',
      messageProperties: {
        projectName: product.Project.Name,
        productName: product.ProductDefinition.Name,
        releaseStatus: release.status,
        releaseError: release.error,
        buildEngineUrl: endpoint.url + '/release-admin/view?id=' + product.WorkflowPublishId,
        consoleTextUrl: release.artifacts['consoleText'] ?? '',
        jobId: '' + product.WorkflowJobId,
        buildId: '' + product.WorkflowBuildId,
        publishId: '' + product.WorkflowPublishId,
        projectId: '' + product.Project.Id,
        projectUrl: product.Project.WorkflowAppProjectUrl
      },
      link: release.artifacts['consoleText'] ?? ''
    }
  );
}
async function notifyProductNotFound(productId: string) {
  await Queues.Emails.add(`Notify SuperAdmins of Failure to Find Product #${productId}`, {
    type: BullMQ.JobType.Email_NotifySuperAdminsGeneric,
    messageKey: 'releaseProductRecordNotFound',
    messageProperties: {
      productId
    }
  });
  return { message: 'Product Not Found' };
}

import type { Prisma } from '@prisma/client';
import type { Job } from 'bullmq';
import { BuildEngine } from '../build-engine-api';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import { Workflow } from '../workflow';
import { addProductPropertiesToEnvironment, getWorkflowParameters } from './common.build-publish';
import { projectUrl } from '$lib/projects/server';
import { WorkflowAction } from '$lib/workflowTypes';

export async function product(job: Job<BullMQ.Publish.Product>): Promise<unknown> {
  const productData = await DatabaseReads.products.findUnique({
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
      BuildEngineJobId: true,
      BuildEngineBuildId: true,
      WorkflowInstance: {
        select: {
          ProductId: true
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
  const productBuild = await DatabaseReads.productBuilds.findFirst({
    where: {
      BuildEngineBuildId: productData.BuildEngineBuildId
    },
    select: {
      Id: true
    }
  });
  if (!productData.BuildEngineBuildId || !productBuild) {
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
      BuildEngineReleaseId: 0
    });
    job.updateProgress(20);
    const params = await getWorkflowParameters(productData.WorkflowInstance.ProductId, 'publish');
    const channel = params['channel'] ?? job.data.defaultChannel;
    job.updateProgress(30);
    const env = await addProductPropertiesToEnvironment(job.data.productId);
    job.updateProgress(40);
    const response = await BuildEngine.Requests.createRelease(
      { type: 'query', organizationId: productData.Project.OrganizationId },
      productData.BuildEngineJobId,
      productData.BuildEngineBuildId,
      {
        channel: channel,
        targets: params['targets'] ?? job.data.defaultTargets,
        environment: { ...env, ...params.environment, ...job.data.environment }
      }
    );
    job.updateProgress(50);
    const isError = response.responseType === 'error';
    if (isError || response.error) {
      const message = (isError ? response.message : response.error)!;
      job.log(message);
      // if final retry
      if (job.attemptsStarted >= (job.opts.attempts ?? 0)) {
        if (isError && response.code === BuildEngine.Types.EndpointUnavailable) {
          await notifyConnectionFailed(
            job.data.productId,
            productData.Project.Id,
            productData.Project.Name!,
            productData.ProductDefinition.Name!,
            job.data.transition
          );
        } else {
          await notifyUnableToCreate(
            job.data.productId,
            productData.Project.Id,
            productData.Project.Name!,
            productData.ProductDefinition.Name!,
            job.data.transition
          );
        }
        const flow = await Workflow.restore(job.data.productId);
        flow?.send({
          type: WorkflowAction.Publish_Failed,
          userId: null,
          comment: message
        });
        return response;
      }
      throw new Error(message);
    } else {
      await DatabaseWrites.products.update(job.data.productId, {
        BuildEngineReleaseId: response.id
      });
      job.updateProgress(65);

      const pub = await DatabaseWrites.productPublications.create({
        data: {
          ProductId: job.data.productId,
          ProductBuildId: productBuild.Id,
          BuildEngineReleaseId: response.id,
          Channel: channel
        }
      });

      job.updateProgress(85);

      const name = `Check status of Publish #${response.id}`;
      await getQueues().Polling.upsertJobScheduler(name, BullMQ.RepeatEveryMinute, {
        name,
        data: {
          type: BullMQ.JobType.Poll_Publish,
          productId: job.data.productId,
          organizationId: productData.Project.OrganizationId,
          jobId: productData.BuildEngineJobId,
          buildId: productData.BuildEngineBuildId,
          releaseId: response.id,
          publicationId: pub.Id,
          transition: job.data.transition
        }
      });
    }
    job.updateProgress(100);
    return {
      response: {
        ...response,
        environment: JSON.parse((response['environment'] as string) ?? '{}')
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

export async function postProcess(job: Job<BullMQ.Publish.PostProcess>): Promise<unknown> {
  const product = await DatabaseReads.products.findUnique({
    where: { Id: job.data.productId },
    select: {
      BuildEngineJobId: true,
      BuildEngineBuildId: true,
      BuildEngineReleaseId: true,
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
        product.Project.Name!,
        product.ProductDefinition.Name!,
        job.data.transition
      );
      flow.send({ type: WorkflowAction.Publish_Completed, userId: null });
      const packageFile = await DatabaseReads.productPublications.findUnique({
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
        packageName = await fetch(packageFile.ProductBuild.ProductArtifacts[0].Url!).then((r) =>
          r.text()
        );
      }
    } else {
      await notifyFailed(
        job.data.publicationId,
        job.data.productId,
        product,
        job.data.release,
        job.data.transition
      );
      const text = job.data.release.artifacts['consoleText']
        ? await fetch(job.data.release.artifacts['consoleText']).then((r) => r.text())
        : '';
      flow.send({
        type: text.match(/Google Api Error/i)
          ? WorkflowAction.Google_API_Error
          : WorkflowAction.Publish_Failed,
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
  productName: string,
  transition?: number
) {
  return getQueues().Emails.add(
    `Notify Owner/Admins of Failure to Create Release for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId,
      messageKey: 'releaseFailedUnableToConnect',
      messageProperties: {
        projectName,
        productName
      },
      transition
    }
  );
}
async function notifyUnableToCreate(
  productId: string,
  projectId: number,
  projectName: string,
  productName: string,
  transition?: number
) {
  return getQueues().Emails.add(
    `Notify Owner/Admins of Failure to Create Release for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId,
      messageKey: 'releaseFailedUnableToCreate',
      messageProperties: {
        projectName,
        productName
      },
      transition
    }
  );
}
async function notifyCompleted(
  publicationId: number,
  productId: string,
  userId: number,
  projectName: string,
  productName: string,
  transition?: number
) {
  return getQueues().Emails.add(
    `Notify Owner of Successful Completion of Release #${publicationId} for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToUser,
      userId,
      messageKey: 'releaseCompletedSuccessfully',
      messageProperties: {
        projectName,
        productName
      },
      transition
    }
  );
}
async function notifyFailed(
  publicationId: number,
  productId: string,
  product: Prisma.ProductsGetPayload<{
    select: {
      BuildEngineBuildId: true;
      BuildEngineJobId: true;
      BuildEngineReleaseId: true;
      ProductDefinition: {
        select: { Name: true };
      };
      Project: {
        select: {
          Id: true;
          Name: true;
          OrganizationId: true;
        };
      };
    };
  }>,
  release: BuildEngine.Types.ReleaseResponse,
  transition?: number
) {
  const endpoint = await BuildEngine.Requests.getURLandToken(product.Project.OrganizationId);
  return getQueues().Emails.add(
    `Notify Owner/Admins of Failure to Create Release #${publicationId} for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId: product.Project.Id,
      messageKey: 'releaseFailed',
      messageProperties: {
        projectName: product.Project.Name!,
        productName: product.ProductDefinition.Name!,
        releaseStatus: release.status,
        releaseError: release.error!,
        buildEngineUrl: endpoint.url + '/release-admin/view?id=' + product.BuildEngineReleaseId,
        consoleTextUrl: release.artifacts['consoleText'] ?? '',
        jobId: '' + product.BuildEngineJobId,
        buildId: '' + product.BuildEngineBuildId,
        publishId: '' + product.BuildEngineReleaseId,
        projectId: '' + product.Project.Id,
        projectUrl: projectUrl(product.Project.Id)
      },
      link: release.artifacts['consoleText'] ?? '',
      transition
    }
  );
}
export async function notifyProductNotFound(productId: string) {
  await getQueues().Emails.add(`Notify SuperAdmins of Failure to Find Product #${productId}`, {
    type: BullMQ.JobType.Email_NotifySuperAdminsLowPriority,
    messageKey: 'releaseProductRecordNotFound',
    messageProperties: {
      productId
    }
  });
  return { message: 'Product Not Found' };
}

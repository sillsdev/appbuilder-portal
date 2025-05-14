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

export async function product(job: Job<BullMQ.Build.Product>): Promise<unknown> {
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
      ProductDefinition: {
        select: {
          Name: true
        }
      },
      WorkflowJobId: true,
      WorkflowInstance: {
        select: {
          Id: true
        }
      }
    }
  });
  if (!productData) {
    return await notifyProductNotFound(job.data.productId);
  }
  job.updateProgress(10);
  if (productData.WorkflowInstance) {
    // reset previous build
    await DatabaseWrites.products.update(job.data.productId, {
      WorkflowBuildId: 0
    });
    job.updateProgress(20);
    const params = await getWorkflowParameters(productData.WorkflowInstance.Id, 'build');
    job.updateProgress(30);
    const env = await addProductPropertiesToEnvironment(job.data.productId);
    job.updateProgress(40);
    const response = await BuildEngine.Requests.createBuild(
      { type: 'query', organizationId: productData.Project.OrganizationId },
      productData.WorkflowJobId,
      {
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
            productData.Project.Id,
            productData.Project.Name,
            productData.ProductDefinition.Name
          );
        } else {
          await notifyUnableToCreate(
            productData.Project.Id,
            productData.Project.Name,
            productData.ProductDefinition.Name
          );
        }
        const flow = await Workflow.restore(job.data.productId);
        flow?.send({
          type: WorkflowAction.Build_Failed,
          userId: null,
          comment: message
        });
      }
      throw new Error(message);
    } else {
      await DatabaseWrites.products.update(job.data.productId, {
        WorkflowBuildId: response.id
      });
      job.updateProgress(65);

      const productBuild = await DatabaseWrites.productBuilds.create({
        data: {
          ProductId: job.data.productId,
          BuildId: response.id
        }
      });

      job.updateProgress(85);

      await Queues.RemotePolling.add(
        `Check status of Build #${response.id}`,
        {
          type: BullMQ.JobType.Build_Check,
          productId: job.data.productId,
          organizationId: productData.Project.OrganizationId,
          jobId: productData.WorkflowJobId,
          buildId: response.id,
          productBuildId: productBuild.Id
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

export async function check(job: Job<BullMQ.Build.Check>): Promise<unknown> {
  const product = await prisma.products.findFirst({
    where: {
      WorkflowJobId: job.data.jobId,
      WorkflowBuildId: job.data.buildId
    },
    select: {
      WorkflowInstance: {
        select: {
          Id: true
        }
      }
    }
  });
  if (!product?.WorkflowInstance) {
    await Queues.RemotePolling.removeRepeatableByKey(job.repeatJobKey);
    job.log('No WorkflowInstance found. Workflow cancelled?');
    if (!product) {
      return await notifyProductNotFound(job.data.productId);
    }
    job.updateProgress(100);
    return { product };
  }
  job.updateProgress(25);
  const response = await BuildEngine.Requests.getBuild(
    { type: 'query', organizationId: job.data.organizationId },
    job.data.jobId,
    job.data.buildId
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    throw new Error(response.message);
  } else {
    if (response.status === 'completed') {
      await Queues.RemotePolling.removeRepeatableByKey(job.repeatJobKey);
      await Queues.Builds.add(
        `PostProcess Build #${job.data.buildId} for Product #${job.data.productId}`,
        {
          type: BullMQ.JobType.Build_PostProcess,
          productId: job.data.productId,
          productBuildId: job.data.productBuildId,
          build: response
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

export async function postProcess(job: Job<BullMQ.Build.PostProcess>): Promise<unknown> {
  const product = await prisma.products.findUnique({
    where: { Id: job.data.productId },
    select: {
      WorkflowJobId: true,
      WorkflowBuildId: true,
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
  if (job.data.build.error) {
    job.log(job.data.build.error);
  }
  let latestArtifactDate = new Date(0);
  job.log('ARTIFACTS:');
  const artifacts = await DatabaseWrites.productArtifacts.createManyAndReturn({
    data: await Promise.all(
      Object.entries(job.data.build.artifacts).map(async ([type, url]) => {
        job.log(`${type}: ${url}`);
        const res = await fetch(url, { method: 'HEAD' });
        const lastModified = new Date(res.headers.get('Last-Modified'));
        if (lastModified > latestArtifactDate) {
          latestArtifactDate = lastModified;
        }

        // On version.json, update the ProductBuild.Version
        if (type === 'version' && res.headers.get('Content-Type') === 'application/json') {
          const version = JSON.parse(await fetch(url).then((r) => r.text()));
          if (version['version']) {
            await DatabaseWrites.productBuilds.update({
              where: {
                Id: job.data.productBuildId
              },
              data: {
                Version: version['version']
              }
            });
            if (job.data.build.result === 'SUCCESS') {
              await DatabaseWrites.products.update(job.data.productId, {
                VersionBuilt: version['version']
              });
            }
          }
        }

        // On play-listing-manifest.json, update the Project.DefaultLanguage
        if (
          type == 'play-listing-manifest' &&
          res.headers.get('Content-Type') === 'application/json'
        ) {
          const manifest = JSON.parse(await fetch(url).then((r) => r.text()));
          if (manifest['default-language']) {
            const lang = await prisma.storeLanguages.findFirst({
              where: {
                Name: manifest['default-language']
              },
              select: {
                Id: true
              }
            });
            if (lang !== null) {
              await DatabaseWrites.products.update(job.data.productId, {
                StoreLanguageId: lang.Id
              });
            }
          }
        }

        return {
          ProductId: job.data.productId,
          ProductBuildId: job.data.productBuildId,
          ArtifactType: type,
          Url: url,
          ContentType: res.headers.get('Content-Type'),
          FileSize:
            res.headers.get('Content-Type') !== 'text/html'
              ? parseInt(res.headers.get('Content-Length'))
              : undefined
        };
      })
    )
  });
  await DatabaseWrites.products.update(job.data.productId, {
    DateBuilt: latestArtifactDate
  });
  job.updateProgress(75);
  await DatabaseWrites.productBuilds.update({
    where: {
      Id: job.data.productBuildId
    },
    data: {
      Success: job.data.build.result === 'SUCCESS'
    }
  });
  job.updateProgress(90);
  const flow = await Workflow.restore(job.data.productId);
  if (flow) {
    if (job.data.build.result === 'SUCCESS') {
      await notifyCompleted(
        job.data.productBuildId,
        job.data.productId,
        product.Project.OwnerId,
        product.Project.Name,
        product.ProductDefinition.Name
      );
      flow.send({ type: WorkflowAction.Build_Successful, userId: null });
    } else {
      await notifyFailed(
        job.data.productBuildId,
        job.data.productId,
        product.Project,
        product,
        job.data.build
      );
      flow.send({
        type: WorkflowAction.Build_Failed,
        userId: null,
        comment: `system.build-failed,${job.data.build.artifacts['consoleText'] ?? ''}`
      });
    }
  }
  job.updateProgress(100);
  return {
    created: artifacts.length,
    artifacts: artifacts.map((a) => ({ ...a, FileSize: a.FileSize?.toString() }))
  };
}

async function notifyConnectionFailed(projectId: number, projectName: string, productName: string) {
  return Queues.Emails.add(`Notify Owner/Admins of Project #${projectId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'buildFailedUnableToConnect',
    messageProperties: {
      projectName,
      productName
    }
  });
}

async function notifyUnableToCreate(projectId: number, projectName: string, productName: string) {
  return Queues.Emails.add(`Notify Owner/Admins of Project #${projectId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'buildFailedUnableToCreate',
    messageProperties: {
      projectName,
      productName
    }
  });
}

async function notifyCompleted(
  productBuildId: number,
  productId: string,
  userId: number,
  projectName: string,
  productName: string
) {
  return Queues.Emails.add(
    `Notify Owner of Successful Creation of Build #${productBuildId} for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToUser,
      userId,
      messageKey: 'buildCompletedSuccessfully',
      messageProperties: {
        projectName,
        productName
      }
    }
  );
}

async function notifyFailed(
  productBuildId: number,
  productId: string,
  project: Prisma.ProjectsGetPayload<{
    select: {
      Id: true;
      Name: true;
      OrganizationId: true;
      WorkflowAppProjectUrl: true;
    };
  }>,
  product: Prisma.ProductsGetPayload<{
    select: {
      WorkflowBuildId: true;
      WorkflowJobId: true;
      ProductDefinition: {
        select: { Name: true };
      };
    };
  }>,
  buildResponse: BuildEngine.Types.BuildResponse
) {
  const endpoint = await BuildEngine.Requests.getURLandToken(project.OrganizationId);
  return Queues.Emails.add(
    `Notify Owner/Admins of Failure to Create Build #${productBuildId} for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId: project.Id,
      messageKey: 'buildFailed',
      messageProperties: {
        projectName: project.Name,
        productName: product.ProductDefinition.Name,
        buildStatus: buildResponse.status,
        buildError: buildResponse.error,
        buildEngineUrl: endpoint.url + '/build-admin/view?id=' + product.WorkflowBuildId,
        consoleText: buildResponse.artifacts['consoleText'] ?? '',
        projectId: '' + project.Id,
        jobId: '' + product.WorkflowJobId,
        buildId: '' + product.WorkflowBuildId,
        projectUrl: project.WorkflowAppProjectUrl
      },
      link: buildResponse.artifacts['consoleText'] ?? ''
    }
  );
}

async function notifyProductNotFound(productId: string) {
  await Queues.Emails.add(`Notify SuperAdmins of Failure to Find Product #${productId}`, {
    type: BullMQ.JobType.Email_NotifySuperAdminsGeneric,
    messageKey: 'buildProductRecordNotFound',
    messageProperties: {
      productId
    }
  });
  return { message: 'Product Not Found' };
}

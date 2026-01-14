import type { Prisma } from '@prisma/client';
import type { Job } from 'bullmq';
import { BuildEngine } from '../build-engine-api';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import { Workflow } from '../workflow';
import { addProductPropertiesToEnvironment, getWorkflowParameters } from './common.build-publish';
import { fetchPackageName, getComputeType, updateComputeType } from '$lib/products';
import { projectUrl } from '$lib/projects/server';
import { WorkflowAction } from '$lib/workflowTypes';

export async function product(job: Job<BullMQ.Build.Product>): Promise<unknown> {
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

      const name = `Check status of Build #${response.id}`;
      await getQueues().Polling.upsertJobScheduler(name, BullMQ.RepeatEveryMinute, {
        name,
        data: {
          type: BullMQ.JobType.Poll_Build,
          productId: job.data.productId,
          organizationId: productData.Project.OrganizationId,
          jobId: productData.WorkflowJobId,
          buildId: response.id,
          productBuildId: productBuild.Id,
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

export async function postProcess(job: Job<BullMQ.Build.PostProcess>): Promise<unknown> {
  const product = await DatabaseReads.products.findUnique({
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
          OrganizationId: true
        }
      },
      Properties: true
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
    data: (
      await Promise.all(
        Object.entries(job.data.build.artifacts).map(async ([type, url]) => {
          job.log(`${type}: ${url}`);
          if (url) {
            const res = await fetch(url, { method: 'HEAD' });
            const lastModified = new Date(res.headers.get('Last-Modified')!);
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
              if (version['appbuilderVersion']) {
                await DatabaseWrites.productBuilds.update({
                  where: {
                    Id: job.data.productBuildId
                  },
                  data: {
                    AppBuilderVersion: version['appbuilderVersion']
                  }
                });
              }
            }

            // On play-listing-manifest.json, update the Project.DefaultLanguage
            if (
              type == 'play-listing-manifest' &&
              res.headers.get('Content-Type') === 'application/json'
            ) {
              const manifest = JSON.parse(await fetch(url).then((r) => r.text()));
              if (manifest['default-language']) {
                const lang = await DatabaseReads.storeLanguages.findFirst({
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

            if (type === 'package_name' && res.headers.get('Content-Type') === 'text/plain') {
              const PackageName = await fetchPackageName(url);
              // populate package name if publish link is not set
              if (PackageName) {
                await DatabaseWrites.products.update(job.data.productId, { PackageName });
              }
            }

            return {
              ProductId: job.data.productId,
              ProductBuildId: job.data.productBuildId,
              ArtifactType: type,
              Url: url,
              ContentType: res.headers.get('Content-Type'),
              FileSize:
                res.headers.get('Content-Type') !== 'text/html' && res.headers.get('Content-Length')
                  ? BigInt(res.headers.get('Content-Length')!)
                  : null
            };
          } else {
            return null;
          }
        })
      )
    ).filter((pa) => !!pa)
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
        product.Project.Name!,
        product.ProductDefinition.Name!,
        job.data.transition
      );
      flow.send({ type: WorkflowAction.Build_Successful, userId: null });
    } else {
      let action = WorkflowAction.Build_Failed;
      const currentCompute = getComputeType(product.Properties);
      if (currentCompute !== 'medium') {
        try {
          const text = await fetch(job.data.build.artifacts['consoleText']).then((r) => r.text());
          if (text.match('Gradle build daemon disappeared unexpectedly')) {
            const newProps = updateComputeType(product.Properties, 'medium');
            // make sure props are actually updated...
            // we don't want infinite retries if this somehow fails...
            if (
              newProps !== product.Properties &&
              (await DatabaseWrites.products.update(job.data.productId, {
                Properties: newProps
              }))
            ) {
              action = WorkflowAction.Retry;
            }
          }
        } catch {
          /* empty */
        }
      }
      if (action === WorkflowAction.Build_Failed) {
        await notifyFailed(
          job.data.productBuildId,
          job.data.productId,
          product,
          job.data.build,
          job.data.transition
        );
        flow.send({
          type: action,
          userId: null,
          comment: `system.build-failed,${job.data.build.artifacts['consoleText'] ?? ''}`
        });
      } else {
        await notifyRetrying(
          job.data.productBuildId,
          job.data.productId,
          product,
          job.data.build,
          job.data.transition
        );
        flow.send({
          type: action,
          userId: null,
          comment:
            'Build may have failed due to insufficient memory. Retrying with medium compute type.'
        });
      }
    }
  }
  job.updateProgress(100);
  return {
    created: artifacts.length,
    artifacts: artifacts.map((a) => ({ ...a, FileSize: a.FileSize?.toString() }))
  };
}

async function notifyConnectionFailed(
  productId: string,
  projectId: number,
  projectName: string,
  productName: string,
  transition?: number
) {
  return getQueues().Emails.add(
    `Notify Owner/Admins of Failure to Create Build for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId,
      messageKey: 'buildFailedUnableToConnect',
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
    `Notify Owner/Admins of Failure to Create Build for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId,
      messageKey: 'buildFailedUnableToCreate',
      messageProperties: {
        projectName,
        productName
      },
      transition
    }
  );
}
async function notifyCompleted(
  productBuildId: number,
  productId: string,
  userId: number,
  projectName: string,
  productName: string,
  transition?: number
) {
  return getQueues().Emails.add(
    `Notify Owner of Successful Completion of Build #${productBuildId} for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToUser,
      userId,
      messageKey: 'buildCompletedSuccessfully',
      messageProperties: {
        projectName,
        productName
      },
      transition
    }
  );
}
async function notifyFailed(
  productBuildId: number,
  productId: string,
  product: Prisma.ProductsGetPayload<{
    select: {
      WorkflowBuildId: true;
      WorkflowJobId: true;
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
  buildResponse: BuildEngine.Types.BuildResponse,
  transition?: number
) {
  const endpoint = await BuildEngine.Requests.getURLandToken(product.Project.OrganizationId);
  return getQueues().Emails.add(
    `Notify Owner/Admins of Failure to Create Build #${productBuildId} for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
      projectId: product.Project.Id,
      messageKey: 'buildFailed',
      messageProperties: {
        projectName: product.Project.Name!,
        productName: product.ProductDefinition.Name!,
        buildStatus: buildResponse.status,
        buildError: buildResponse.error!,
        buildEngineUrl: endpoint.url + '/build-admin/view?id=' + product.WorkflowBuildId,
        consoleText: buildResponse.artifacts['consoleText'] ?? '',
        projectId: '' + product.Project.Id,
        jobId: '' + product.WorkflowJobId,
        buildId: '' + product.WorkflowBuildId,
        projectUrl: projectUrl(product.Project.Id)
      },
      link: buildResponse.artifacts['consoleText'] ?? '',
      transition
    }
  );
}
export async function notifyProductNotFound(productId: string) {
  await getQueues().Emails.add(`Notify SuperAdmins of Failure to Find Product #${productId}`, {
    type: BullMQ.JobType.Email_NotifySuperAdminsLowPriority,
    messageKey: 'buildProductRecordNotFound',
    messageProperties: {
      productId
    }
  });
  return { message: 'Product Not Found' };
}
async function notifyRetrying(
  productBuildId: number,
  productId: string,
  product: Prisma.ProductsGetPayload<{
    select: {
      ProductDefinition: {
        select: { Name: true };
      };
      Project: {
        select: {
          Id: true;
          Name: true;
        };
      };
    };
  }>,
  buildResponse: BuildEngine.Types.BuildResponse,
  transition?: number
) {
  return getQueues().Emails.add(
    `Notify Admins of Retry with Medium Compute for Build #${productBuildId} for Product #${productId}`,
    {
      type: BullMQ.JobType.Email_NotifySuperAdminsLowPriority,
      messageKey: 'retryBuild',
      messageProperties: {
        projectName: product.Project.Name!,
        productName: product.ProductDefinition.Name!,
        projectUrl: projectUrl(product.Project.Id)
      },
      link: buildResponse.artifacts['consoleText'] ?? '',
      transition
    }
  );
}

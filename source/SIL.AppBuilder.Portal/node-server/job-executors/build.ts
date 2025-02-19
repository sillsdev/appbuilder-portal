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
          OrganizationId: true
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
    throw new Error(`Product #${job.data.productId} does not exist!`);
  }
  job.updateProgress(10);
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
  if (response.responseType === 'error') {
    const flow = await Workflow.restore(job.data.productId);
    // TODO: Send Notification of Failure
    flow?.send({ type: WorkflowAction.Build_Failed, userId: null, comment: response.message });
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
    response,
    params,
    env
  };
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
      if (response.error) {
        job.log(response.error);
      }
      let latestArtifactDate = new Date(0);
      job.log('ARTIFACTS:');
      await DatabaseWrites.productArtifacts.createMany({
        data: await Promise.all(
          Object.entries(response.artifacts).map(async ([type, url]) => {
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
                if (response.result === 'SUCCESS') {
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
      job.updateProgress(80);
      await DatabaseWrites.productBuilds.update({
        where: {
          Id: job.data.productBuildId
        },
        data: {
          Success: response.result === 'SUCCESS'
        }
      });
      job.updateProgress(90);
      const flow = await Workflow.restore(job.data.productId);
      if (flow) {
        if (response.result === 'SUCCESS') {
          flow.send({ type: WorkflowAction.Build_Successful, userId: null });
        } else {
          flow.send({
            type: WorkflowAction.Build_Failed,
            userId: null,
            comment: `system.build-failed,${response.artifacts['consoleText'] ?? ''}`
          });
        }
      }
    }
    job.updateProgress(100);
    return response;
  }
}

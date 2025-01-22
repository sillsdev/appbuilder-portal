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
          OrganizationId: true
        }
      },
      WorkflowJobId: true,
      WorkflowBuildId: true,
      WorkflowInstance: {
        select: {
          Id: true
        }
      }
    }
  });
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
    const flow = await Workflow.restore(job.data.productId);
    // TODO: Send notification of failure
    flow.send({
      type: WorkflowAction.Publish_Failed,
      userId: null,
      comment: 'Product does not have a ProductBuild available.'
    });
    job.updateProgress(100);
    return productData;
  }
  job.updateProgress(15);
  await DatabaseWrites.products.update(job.data.productId, {
    WorkflowPublishId: 0
  });
  job.updateProgress(20);
  const channel = params['channel'] ?? job.data.channel;
  const params = await getWorkflowParameters(productData.WorkflowInstance.Id, 'publish');
  job.updateProgress(30);
  const env = await addProductPropertiesToEnvironment(job.data.productId);
  job.updateProgress(40);
  const response = await BuildEngine.Requests.createRelease(
    { type: 'query', organizationId: productData.Project.OrganizationId },
    productData.WorkflowJobId,
    productData.WorkflowBuildId,
    {
      channel: channel,
      targets: params['targets'] ?? job.data.targets,
      environment: { ...env, ...params.environment, ...job.data.environment }
    }
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    const flow = await Workflow.restore(job.data.productId);
    // TODO: Send notification of failure
    flow.send({ type: WorkflowAction.Publish_Failed, userId: null, comment: response.message });
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
    response,
    params,
    env
  };
}

export async function check(job: Job<BullMQ.Publish.Check>): Promise<unknown> {
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
      if (response.error) {
        job.log(response.error);
      }
      let packageName: string | undefined = undefined;
      const flow = await Workflow.restore(job.data.productId);
      if (response.result === 'SUCCESS') {
        const publishUrlFile = response.artifacts['publishUrl'];
        await DatabaseWrites.products.update(job.data.productId, {
          DatePublished: new Date(),
          PublishLink: publishUrlFile
            ? (await fetch(publishUrlFile).then((r) => r.text()))?.trim() ?? undefined
            : undefined
        });
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
        flow.send({
          type: WorkflowAction.Publish_Failed,
          userId: null,
          comment: `system.publish-failed,${response.artifacts['consoleText'] ?? ''}`
        });
      }
      job.updateProgress(80);
      await DatabaseWrites.productPublications.update({
        where: {
          Id: job.data.publicationId
        },
        data: {
          Success: response.result === 'SUCCESS',
          LogUrl: response.console_text,
          Package: packageName?.trim()
        }
      });
    }
    job.updateProgress(100);
    return response;
  }
}

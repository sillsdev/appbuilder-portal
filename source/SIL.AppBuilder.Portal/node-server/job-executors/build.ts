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
      WorkflowJobId: true
    }
  });
  if (!productData) {
    throw new Error(`Product #${job.data.productId} does not exist!`);
  }
  job.updateProgress(25);
  const response = await BuildEngine.Requests.createBuild(
    { type: 'query', organizationId: productData.Project.OrganizationId },
    productData.WorkflowJobId,
    {
      targets: job.data.targets ?? 'apk play-listing',
      environment: job.data.environment
    }
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    const flow = await Workflow.restore(job.data.productId);
    // TODO: How best to notify of failure?
    flow.send({ type: WorkflowAction.Build_Failed, userId: null, comment: response.message });
    job.updateProgress(100);
    return 0;
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

    job.updateProgress(100);
    return response;
  }
}

export async function check(job: Job<BullMQ.Build.Check>): Promise<unknown> {
  const response = await BuildEngine.Requests.getBuild(
    { type: 'query', organizationId: job.data.organizationId },
    job.data.jobId,
    job.data.buildId
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    throw new Error(response.message);
  } else {
    // TODO: what does the 'expired' status mean?
    if (response.status === 'completed' || response.status === 'expired') {
      await Queues.RemotePolling.removeRepeatableByKey(job.repeatJobKey);
      if (response.error) {
        job.log(response.error);
      }
      await DatabaseWrites.productArtifacts.createMany({
        data: await Promise.all(
          Object.entries(response.artifacts).map(async ([type, url]) => {
            const res = await fetch(url, { method: 'HEAD' });
            return {
              ProductId: job.data.productId,
              ProductBuildId: job.data.productBuildId,
              ArtifactType: type,
              Url: url,
              ContentType: res.headers.get('Content-Type'),
              LastModified: new Date(res.headers.get('Last-Modified')),
              FileSize:
                  res.headers.get('Content-Type') !== 'text/html'
                    ? parseInt(res.headers.get('Content-Length'))
                    : undefined
            };
          })
        )
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
    job.updateProgress(100);
    return response;
  }
}


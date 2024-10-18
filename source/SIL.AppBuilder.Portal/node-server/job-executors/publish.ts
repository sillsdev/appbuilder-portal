import {
  BullMQ,
  prisma,
  DatabaseWrites,
  BuildEngine,
  Workflow,
  queues
} from 'sil.appbuilder.portal.common';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';
import { WorkflowAction } from 'sil.appbuilder.portal.common/workflow';

export class Product extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Publish_Product> {
  async execute(job: Job<BullMQ.Publish.Product, number, string>): Promise<number> {
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
        WorkflowBuildId: true
      }
    });
    job.updateProgress(25);
    const response = await BuildEngine.Requests.createRelease(
      { type: 'query', organizationId: productData.Project.OrganizationId },
      productData.WorkflowJobId,
      productData.WorkflowBuildId,
      {
        channel: job.data.channel,
        targets: job.data.targets,
        environment: job.data.environment
      }
    );
    job.updateProgress(50);
    if (response.responseType === 'error') {
      const flow = await Workflow.restore(job.data.productId);
      // TODO: How best to notify of failure?
      flow.send({ type: WorkflowAction.Publish_Failed, userId: null, comment: response.message });
      job.updateProgress(100);
      return 0;
    } else {
      await DatabaseWrites.products.update(job.data.productId, {
        WorkflowPublishId: response.id,
        DateUpdated: new Date()
      });
      job.updateProgress(65);

      const timestamp = new Date();
      const pub = await DatabaseWrites.productPublications.create({
        data: {
          ProductId: job.data.productId,
          ProductBuildId: productData.WorkflowBuildId,
          ReleaseId: response.id,
          Channel: job.data.channel,
          DateCreated: timestamp,
          DateUpdated: timestamp
        }
      });

      job.updateProgress(85);

      await queues.scriptoria.add(
        `Check status of Publish #${response.id}`,
        {
          type: BullMQ.ScriptoriaJobType.Publish_Check,
          productId: job.data.productId,
          organizationId: productData.Project.OrganizationId,
          jobId: productData.WorkflowJobId,
          buildId: productData.WorkflowBuildId,
          releaseId: response.id,
          publicationId: pub.Id
        },
        {
          repeat: {
            pattern: '*/1 * * * *' // every minute
          }
        }
      );
      job.updateProgress(100);

      return response.id;
    }
  }
}

export class Check extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Publish_Check> {
  async execute(job: Job<BullMQ.Publish.Check, number, string>): Promise<number> {
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
      // TODO: what does the 'expired' status mean?
      if (response.status === 'completed' || response.status === 'expired') {
        await queues.scriptoria.removeRepeatableByKey(job.repeatJobKey);
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
              : undefined,
            DateUpdated: new Date()
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
            Package: packageName?.trim(),
            DateUpdated: new Date()
          }
        });
        job.updateProgress(100);
        return response.id;
      }
      job.updateProgress(100);
      return 0;
    }
  }
}

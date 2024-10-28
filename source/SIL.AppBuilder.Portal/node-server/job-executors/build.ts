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

export class Product extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Build_Product> {
  async execute(job: Job<BullMQ.Build.Product, number, string>): Promise<number> {
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

      await queues.scriptoria.add(
        `Check status of Build #${response.id}`,
        {
          type: BullMQ.ScriptoriaJobType.Build_Check,
          productId: job.data.productId,
          organizationId: productData.Project.OrganizationId,
          jobId: productData.WorkflowJobId,
          buildId: response.id,
          productBuildId: productBuild.Id
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

export class Check extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Build_Check> {
  async execute(job: Job<BullMQ.Build.Check, number, string>): Promise<number> {
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
        await queues.scriptoria.removeRepeatableByKey(job.repeatJobKey!);
        if (response.error) {
          job.log(response.error);
        }
        let latestArtifactDate = new Date(0);
        await DatabaseWrites.productArtifacts.createMany({
          data: await Promise.all(
            Object.entries(response.artifacts).map(async ([type, url]) => {
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
        if (response.result === 'SUCCESS') {
          flow.send({ type: WorkflowAction.Build_Successful, userId: null });
        } else {
          flow.send({
            type: WorkflowAction.Build_Failed,
            userId: null,
            comment: `system.build-failed,${response.artifacts['consoleText'] ?? ''}`
          });
        }
        job.updateProgress(100);
        return response.id;
      }
      job.updateProgress(100);
      return 0;
    }
  }
}

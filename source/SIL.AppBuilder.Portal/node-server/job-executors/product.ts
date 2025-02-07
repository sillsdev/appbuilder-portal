import { Job } from 'bullmq';
import {
  BuildEngine,
  BullMQ,
  DatabaseWrites,
  prisma,
  Workflow
} from 'sil.appbuilder.portal.common';
import {
  ENVKeys,
  WorkflowAction,
  WorkflowInstanceContext
} from 'sil.appbuilder.portal.common/workflow';

export async function create(job: Job<BullMQ.Product.Create>): Promise<unknown> {
  const productData = await prisma.products.findUnique({
    where: {
      Id: job.data.productId
    },
    select: {
      Project: {
        select: {
          ApplicationType: {
            select: {
              Name: true
            }
          },
          WorkflowProjectUrl: true,
          OrganizationId: true
        }
      },
      Store: {
        select: {
          Name: true
        }
      }
    }
  });
  job.updateProgress(25);
  const response = await BuildEngine.Requests.createJob(
    { type: 'query', organizationId: productData.Project.OrganizationId },
    {
      request_id: job.data.productId,
      git_url: productData.Project.WorkflowProjectUrl,
      app_id: productData.Project.ApplicationType.Name,
      publisher_id: productData.Store.Name
    }
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    // TODO: What do I do here? Wait some period of time and retry?
    job.log(response.message);
    throw new Error(response.message);
  } else {
    await DatabaseWrites.products.update(job.data.productId, {
      WorkflowJobId: response.id
    });
    job.updateProgress(75);
    const flow = await Workflow.restore(job.data.productId);

    flow?.send({ type: WorkflowAction.Product_Created, userId: null });

    job.updateProgress(100);
    return response;
  }
}

export async function deleteProduct(job: Job<BullMQ.Product.Delete>): Promise<unknown> {
  const response = await BuildEngine.Requests.deleteJob(
    { type: 'query', organizationId: job.data.organizationId },
    job.data.workflowJobId
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    job.log(response.message);
    throw new Error(response.message);
  } else {
    job.updateProgress(100);
    return response.status;
  }
}

export async function getVersionCode(job: Job<BullMQ.Product.GetVersionCode>): Promise<unknown> {
  let versionCode = 0;
  const product = await prisma.products.findUnique({
    where: {
      Id: job.data.productId
    },
    select: {
      WorkflowBuildId: true,
      WorkflowJobId: true,
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
  if (product?.WorkflowBuildId && product?.WorkflowJobId) {
    const productBuild = await prisma.productBuilds.findFirst({
      where: {
        ProductId: job.data.productId,
        BuildId: product.WorkflowBuildId
      },
      select: {
        Id: true
      }
    });
    if (!productBuild) {
      return 0;
    }
    job.updateProgress(45);
    const versionCodeArtifact = await prisma.productArtifacts.findFirst({
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
    const version = JSON.parse(await fetch(versionCodeArtifact.Url).then((r) => r.text()));
    if (version['versionCode'] !== undefined) {
      versionCode = parseInt(version['versionCode']);
    }
    job.updateProgress(75);
  }
  if (versionCode) {
    const instance = await prisma.workflowInstances.findUnique({
      where: {
        ProductId: job.data.productId
      },
      select: {
        Id: true,
        Context: true
      }
    });
    const ctx: WorkflowInstanceContext = JSON.parse(instance.Context);
    job.updateProgress(90);
    await DatabaseWrites.workflowInstances.update({
      where: {
        Id: instance.Id
      },
      data: {
        Context: JSON.stringify({
          ...ctx,
          environment: {
            ...ctx.environment,
            [ENVKeys.PUBLISH_GOOGLE_PLAY_UPLOADED_BUILD_ID]: '' + product.WorkflowBuildId,
            [ENVKeys.PUBLISH_GOOGLE_PLAY_UPLOADED_VERSION_CODE]: '' + versionCode
          }
        } as WorkflowInstanceContext)
      }
    });
  }
  job.updateProgress(100);
  return versionCode;
}

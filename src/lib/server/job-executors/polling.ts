import type { Job } from 'bullmq';
import { BuildEngine } from '../build-engine-api';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import { notifyProductNotFound as build_notifyProductNotFound } from './build';
import { notifyNotFound } from './project';
import { notifyProductNotFound as publish_notifyProductNotFound } from './publish';
import { NotificationType } from '$lib/users';

export async function build(job: Job<BullMQ.Polling.Build>): Promise<unknown> {
  const product = await DatabaseReads.products.findFirst({
    where: {
      BuildEngineJobId: job.data.jobId,
      BuildEngineBuildId: job.data.buildId
    },
    select: {
      WorkflowInstance: {
        select: {
          ProductId: true
        }
      }
    }
  });
  if (!product?.WorkflowInstance) {
    await getQueues().Polling.removeJobScheduler(job.name);
    job.log('No WorkflowInstance found. Workflow cancelled?');
    if (!product) {
      return await build_notifyProductNotFound(job.data.productId);
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
      await getQueues().Polling.removeJobScheduler(job.name);
      await getQueues().Builds.add(
        `PostProcess Build #${job.data.buildId} for Product #${job.data.productId}`,
        {
          type: BullMQ.JobType.Build_PostProcess,
          productId: job.data.productId,
          productBuildId: job.data.productBuildId,
          build: response,
          transition: job.data.transition
        }
      );
    }
    job.updateProgress(100);
    return {
      ...response,
      environment: JSON.parse((response['environment'] as string) || '{}')
    };
  }
}

export async function publish(job: Job<BullMQ.Polling.Publish>): Promise<unknown> {
  const product = await DatabaseReads.products.findFirst({
    where: {
      BuildEngineJobId: job.data.jobId,
      BuildEngineBuildId: job.data.buildId,
      BuildEngineReleaseId: job.data.releaseId
    },
    select: {
      WorkflowInstance: {
        select: {
          ProductId: true
        }
      }
    }
  });
  if (!product?.WorkflowInstance) {
    await getQueues().Polling.removeJobScheduler(job.name);
    job.log('No WorkflowInstance found. Workflow cancelled?');
    if (!product) {
      return await publish_notifyProductNotFound(job.data.productId);
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
      await getQueues().Polling.removeJobScheduler(job.name);
      await getQueues().Publishing.add(
        `PostProcess Release #${job.data.releaseId} for Product #${job.data.productId}`,
        {
          type: BullMQ.JobType.Publish_PostProcess,
          productId: job.data.productId,
          productBuildId: job.data.productBuildId,
          release: response,
          transition: job.data.transition
        }
      );
    }
    job.updateProgress(100);
    return {
      ...response,
      environment: JSON.parse((response['environment'] as string) || '{}')
    };
  }
}

export async function project(job: Job<BullMQ.Polling.Project>): Promise<unknown> {
  const project = await DatabaseReads.projects.findUnique({
    where: { Id: job.data.projectId },
    select: {
      Name: true,
      BuildEngineProjectId: true,
      OwnerId: true
    }
  });
  if (!project) {
    return await notifyNotFound(job.data.projectId);
  }
  const response = await BuildEngine.Requests.getProject(
    { type: 'query', organizationId: job.data.organizationId },
    job.data.buildEngineProjectId
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    job.log(response.message);
    /*
    // BuildEngineProjectService.CreateBuildEngineProjectAsync
    // S2 implementation continues indefinitely, so no real way to implement this
    if (???) {
      await notifyUnableToCreate(job.data.projectId, project.Name);
    }*/
    throw new Error(response.message);
  } else {
    if (response.status === 'completed') {
      await getQueues().Polling.removeJobScheduler(job.name);
      const project = await DatabaseReads.projects.findUniqueOrThrow({
        where: { Id: job.data.projectId },
        select: {
          Name: true,
          BuildEngineProjectId: true,
          OwnerId: true
        }
      });
      if (response.result === 'FAILURE') {
        const buildEngineUrl =
          (await BuildEngine.Requests.queryURLandToken(job.data.organizationId)).url +
          '/project-admin/view?id=' +
          project.BuildEngineProjectId;
        await notifyCreationFailed(
          job.data.projectId,
          project.Name!,
          response.status,
          response.error!,
          buildEngineUrl
        );
      } else {
        // BuildEngineProjectService.ProjectCompletedAsync
        await DatabaseWrites.projects.update(job.data.projectId, {
          RepositoryUrl: response.url
        });

        await notifyCreated(job.data.projectId, project.OwnerId, project.Name!);

        const projectImport = (
          await DatabaseReads.projects.findUnique({
            where: {
              Id: job.data.projectId
            },
            select: {
              ProjectImport: {
                select: {
                  Id: true
                }
              }
            }
          })
        )?.ProjectImport;
        if (projectImport) {
          await getQueues().Projects.add(`Import Products for Project #${job.data.projectId}`, {
            type: BullMQ.JobType.Project_ImportProducts,
            organizationId: job.data.organizationId,
            importId: projectImport.Id,
            projectId: job.data.projectId
          });
        }
      }
    }
    job.updateProgress(100);
    return response;
  }
}

async function notifyCreationFailed(
  projectId: number,
  projectName: string,
  projectStatus: string,
  projectError: string,
  buildEngineUrl: string
) {
  // BuildEngineProjectService.ProjectCreationFailedAsync
  return getQueues().Emails.add(`Notify Owner/Admins of Project #${projectId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    // Admin or Owner suffix is added by sender
    messageKey: 'projectCreationFailed',
    messageProperties: {
      projectName,
      projectStatus,
      projectError,
      buildEngineUrl
    }
  });
}
async function notifyCreated(projectId: number, userId: number, projectName: string) {
  return getQueues().Emails.add(`Notify Owner of Successful Creation of Project #${projectId}`, {
    type: BullMQ.JobType.Email_SendNotificationToUser,
    userId,
    messageKey: 'projectCreatedSuccessfully',
    messageProperties: {
      projectName
    },
    forceIfAllow: NotificationType.OwnerJobComplete
  });
}

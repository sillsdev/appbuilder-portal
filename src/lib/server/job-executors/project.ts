import type { Job } from 'bullmq';
import { BuildEngine } from '../build-engine-api';
import { BullMQ, getQueues } from '../bullmq';
import { DatabaseReads, DatabaseWrites } from '../database';
import { Workflow } from '../workflow';

export async function create(job: Job<BullMQ.Project.Create>): Promise<unknown> {
  const projectData = await DatabaseReads.projects.findUniqueOrThrow({
    where: {
      Id: job.data.projectId
    },
    select: {
      Organization: {
        select: {
          Id: true,
          Name: true
        }
      },
      ApplicationType: {
        select: {
          Name: true
        }
      },
      Name: true,
      Language: true
    }
  });
  if (!projectData) {
    return await notifyNotFound(job.data.projectId);
  }
  job.updateProgress(25);
  const response = await BuildEngine.Requests.createProject(
    { type: 'query', organizationId: projectData.Organization.Id },
    {
      app_id: projectData.ApplicationType.Name!,
      project_name: projectData.Name!,
      language_code: projectData.Language!,
      storage_type: 's3'
    }
  );
  job.updateProgress(50);
  const isError = response.responseType === 'error';
  if (isError || response.error) {
    const message = isError ? response.message : response.error;
    job.log(message!);
    // if final retry
    if (job.attemptsStarted >= (job.opts.attempts ?? 0)) {
      if (isError && response.code === BuildEngine.Types.EndpointUnavailable) {
        await notifyConnectionFailed(
          job.data.projectId,
          projectData.Name!,
          projectData.Organization.Name!
        );
      } else {
        await notifyUnableToCreate(job.data.projectId, projectData.Name!);
      }
    }
    throw new Error(message!);
  } else {
    await DatabaseWrites.projects.update(job.data.projectId, {
      WorkflowProjectId: response.id,
      WorkflowAppProjectUrl: `${process.env.ORIGIN || 'http://localhost:6173'}/projects/${
        job.data.projectId
      }`
    });
    job.updateProgress(75);

    const name = `Check status of Project #${response.id}`;
    await getQueues().Polling.upsertJobScheduler(name, BullMQ.RepeatEveryMinute, {
      name,
      data: {
        type: BullMQ.JobType.Poll_Project,
        workflowProjectId: response.id,
        organizationId: projectData.Organization.Id,
        projectId: job.data.projectId
      }
    });

    job.updateProgress(100);
    return response;
  }
}

export async function importProducts(job: Job<BullMQ.Project.ImportProducts>): Promise<unknown> {
  const projectImport = await DatabaseReads.projectImports.findUniqueOrThrow({
    where: {
      Id: job.data.importId
    }
  });
  job.updateProgress(25);
  const productsToCreate: { Name: string; Store: string }[] = JSON.parse(
    projectImport.ImportData!
  ).Products;
  job.updateProgress(30);
  const products = await Promise.all(
    productsToCreate.map(async (p) => {
      const productDefinitionId = await DatabaseReads.productDefinitions.findFirst({
        where: {
          Name: p.Name,
          OrganizationProductDefinitions: {
            some: {
              OrganizationId: job.data.organizationId
            }
          }
        },
        select: {
          Id: true
        }
      });
      if (!productDefinitionId) return null;
      const storeId = await DatabaseReads.stores.findFirst({
        where: {
          Name: p.Store,
          OrganizationStores: {
            some: {
              OrganizationId: job.data.organizationId
            }
          }
        },
        select: {
          Id: true
        }
      });
      if (!storeId) return null;
      const productId = await DatabaseWrites.products.create({
        ProjectId: job.data.projectId,
        ProductDefinitionId: productDefinitionId.Id,
        StoreId: storeId.Id,
        WorkflowJobId: 0,
        WorkflowBuildId: 0,
        WorkflowPublishId: 0
      });
      if (!productId) return null;
      const flowDefinition = (
        await DatabaseReads.productDefinitions.findUnique({
          where: {
            Id: productDefinitionId.Id
          },
          select: {
            Workflow: {
              select: {
                Id: true,
                Type: true,
                ProductType: true,
                WorkflowOptions: true
              }
            }
          }
        })
      )?.Workflow;
      if (flowDefinition) {
        await Workflow.create(productId, {
          productType: flowDefinition.ProductType,
          options: new Set(flowDefinition.WorkflowOptions),
          workflowType: flowDefinition.Type
        });
      }
      return {
        ...p,
        Id: productId
      };
    })
  );
  job.updateProgress(75);
  await getQueues().Emails.add(`Notify Owner about Import of Project #${job.data.projectId}`, {
    type: BullMQ.JobType.Email_ProjectImportReport,
    importId: job.data.importId
  });
  job.updateProgress(100);
  return { products };
}

export async function notifyNotFound(projectId: number) {
  await getQueues().Emails.add(`Notify SuperAdmins of Failure to Find Project #${projectId}`, {
    type: BullMQ.JobType.Email_NotifySuperAdminsLowPriority,
    messageKey: 'projectRecordNotFound',
    messageProperties: {
      projectId: '' + projectId
    }
  });
  return { message: 'Project Not Found' };
}
async function notifyConnectionFailed(projectId: number, projectName: string, orgName: string) {
  return getQueues().Emails.add(`Notify Owner/Admins of Project #${projectId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'projectFailedBuildEngine',
    messageProperties: {
      projectName,
      orgName
    }
  });
}
async function notifyUnableToCreate(projectId: number, projectName: string) {
  // BuildEngineProjectService.CreateBuildEngineProjectAsync
  return getQueues().Emails.add(`Notify Owner/Admins of Project #${projectId} Creation Failure`, {
    type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
    projectId,
    messageKey: 'projectFailedUnableToCreate',
    messageProperties: {
      projectName
    }
  });
}

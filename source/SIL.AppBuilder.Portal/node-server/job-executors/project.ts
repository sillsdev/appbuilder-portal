import { Job } from 'bullmq';
import { BuildEngine, BullMQ, DatabaseWrites, prisma, Queues } from 'sil.appbuilder.portal.common';

export async function create(job: Job<BullMQ.Project.Create>): Promise<unknown> {
  const projectData = await prisma.projects.findUnique({
    where: {
      Id: job.data.projectId
    },
    select: {
      OrganizationId: true,
      ApplicationType: {
        select: {
          Name: true
        }
      },
      Name: true,
      Language: true
    }
  });
  job.updateProgress(25);
  const response = await BuildEngine.Requests.createProject(
    { type: 'query', organizationId: projectData.OrganizationId },
    {
      app_id: projectData.ApplicationType.Name,
      project_name: projectData.Name,
      language_code: projectData.Language,
      storage_type: 's3'
    }
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    job.log(response.message);
    throw new Error(`Creation of Project #${job.data.projectId} failed!`);
  } else {
    await DatabaseWrites.projects.update(job.data.projectId, {
      WorkflowProjectId: response.id,
      WorkflowAppProjectUrl: `${process.env.UI_URL ?? 'http://localhost:5173'}/projects/${
        job.data.projectId
      }`
    });
    job.updateProgress(75);

    await Queues.RemotePolling.add(
      `Check status of Project #${response.id}`,
      {
        type: BullMQ.JobType.Project_Check,
        workflowProjectId: response.id,
        organizationId: projectData.OrganizationId,
        projectId: job.data.projectId
      },
      BullMQ.RepeatEveryMinute
    );

    job.updateProgress(100);
    return response;
  }
}

export async function check(job: Job<BullMQ.Project.Check>): Promise<unknown> {
  const response = await BuildEngine.Requests.getProject(
    { type: 'query', organizationId: job.data.organizationId },
    job.data.workflowProjectId
  );
  job.updateProgress(50);
  if (response.responseType === 'error') {
    job.log(response.message);
    throw new Error(response.message);
  } else {
    if (response.status === 'completed') {
      await Queues.RemotePolling.removeRepeatableByKey(job.repeatJobKey);
      if (response.error) {
        job.log(response.error);
      } else {
        await DatabaseWrites.projects.update(job.data.projectId, {
          WorkflowProjectUrl: response.url
        });

        const projectImport = (
          await prisma.projects.findUnique({
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
          await Queues.Miscellaneous.add(`Import Products for Project #${job.data.projectId}`, {
            type: BullMQ.JobType.Project_ImportProducts,
            organizationId: job.data.organizationId,
            importId: projectImport.Id
          });
        }
      }
    }
    job.updateProgress(100);
    return response;
  }
}

export async function importProducts(job: Job<BullMQ.Project.ImportProducts>): Promise<unknown> {
  const projectImport = await prisma.projectImports.findUnique({
    where: {
      Id: job.data.importId
    }
  });
  job.updateProgress(25);
  const productsToCreate: { Name: string; Store: string }[] = JSON.parse(
    projectImport.ImportData
  ).Products;
  job.updateProgress(30);
  const products = await Promise.all(
    productsToCreate.map(async (p) => ({
      ...p,
      Id: await DatabaseWrites.products.create({
        ProjectId: projectImport.OwnerId,
        ProductDefinitionId: (
          await prisma.productDefinitions.findFirst({
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
          })
        )?.Id,
        StoreId: (
          await prisma.stores.findFirst({
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
          })
        )?.Id,
        // TODO: StoreLanguage?
        WorkflowJobId: 0,
        WorkflowBuildId: 0,
        WorkflowPublishId: 0
      })
    }))
  );
  job.updateProgress(100);
  return { products };
}

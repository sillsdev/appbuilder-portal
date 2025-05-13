import { Job } from 'bullmq';
import { BuildEngine, BullMQ, DatabaseWrites, prisma, Queues } from 'sil.appbuilder.portal.common';

export async function create(job: Job<BullMQ.Project.Create>): Promise<unknown> {
  const projectData = await prisma.projects.findUnique({
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
    await Queues.Emails.add(
      `Notify SuperAdmins of Failure to Find Project #${job.data.projectId}`,
      {
        type: BullMQ.JobType.Email_NotifySuperAdminsGeneric,
        messageKey: 'projectRecordNotFound',
        messageProperties: {
          projectId: '' + job.data.projectId
        }
      }
    );

    return { message: 'Project Not Found' };
  }
  job.updateProgress(25);
  const response = await BuildEngine.Requests.createProject(
    { type: 'query', organizationId: projectData.Organization.Id },
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
    // if final retry
    if (job.attemptsMade >= job.opts.attempts) {
      await Queues.Emails.add(
        `Notify Admins of Project #${job.data.projectId} Creation Failure`,
        {
          type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
          projectId: job.data.projectId,
          messageKey: 'projectFailedBuildEngine',
          messageProperties: {
            projectName: projectData.Name,
            orgName: projectData.Organization.Name
          }
        }
      );
    }
    throw new Error(`Creation of Project #${job.data.projectId} failed!`);
  } else {
    await DatabaseWrites.projects.update(job.data.projectId, {
      WorkflowProjectId: response.id,
      WorkflowAppProjectUrl: `${process.env.UI_URL || 'http://localhost:6173'}/projects/${
        job.data.projectId
      }`
    });
    job.updateProgress(75);

    await Queues.RemotePolling.add(
      `Check status of Project #${response.id}`,
      {
        type: BullMQ.JobType.Project_Check,
        workflowProjectId: response.id,
        organizationId: projectData.Organization.Id,
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
    /*
    // BuildEngineProjectService.CreateBuildEngineProjectAsync
    // S2 implementation continues indefinitely, so no real way to implement this
    if (???) {
      await Queues.Emails.add(``, {
        type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
        projectId: job.data.projectId,
        messageKey: 'projectFailedUnableToCreate',
        messageProperties: {
          projectName: project.Name
        }
      });
    }*/
    throw new Error(response.message);
  } else {
    if (response.status === 'completed') {
      await Queues.RemotePolling.removeRepeatableByKey(job.repeatJobKey);
      const project = await prisma.projects.findUnique({
        where: { Id: job.data.projectId },
        select: {
          Name: true,
          WorkflowProjectId: true,
          OwnerId: true
        }
      });
      if (response.result === 'FAILURE') {
        // BuildEngineProjectService.ProjectCreationFailedAsync
        const buildEngineUrl =
          (await BuildEngine.Requests.getURLandToken(job.data.organizationId)).url +
          '/project-admin/view?id=' +
          project.WorkflowProjectId;
        await Queues.Emails.add(
          `Notify Admins of Project #${job.data.projectId} Creation Failure`,
          {
            type: BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner,
            projectId: job.data.projectId,
            // Admin or Owner suffix is added by sender
            messageKey: 'projectCreationFailed',
            messageProperties: {
              projectName: project.Name,
              projectStatus: response.status,
              projectError: response.error,
              buildEngineUrl: buildEngineUrl
            }
          }
        );
      } else {
        // BuildEngineProjectService.ProjectCompletedAsync
        await DatabaseWrites.projects.update(job.data.projectId, {
          WorkflowProjectUrl: response.url
        });

        await Queues.Emails.add(
          `Notify User of Successful Creation of Project #${job.data.projectId}`,
          {
            type: BullMQ.JobType.Email_SendNotificationToUser,
            userId: project.OwnerId,
            messageKey: 'projectCreatedSuccessfully',
            messageProperties: {
              projectName: project.Name
            }
          }
        );

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
        ProjectId: job.data.projectId,
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
        WorkflowJobId: 0,
        WorkflowBuildId: 0,
        WorkflowPublishId: 0
      })
    }))
  );
  job.updateProgress(75);
  await Queues.Emails.add(`Notify user about import of Project #${project.Id}`, {
    type: BullMQ.JobType.Email_ProjectImportReport,
    importId: job.data.importId
  });
  job.updateProgress(100);
  return { products };
}

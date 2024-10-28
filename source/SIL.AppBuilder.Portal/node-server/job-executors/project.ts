import { BullMQ, prisma, DatabaseWrites, BuildEngine, queues } from 'sil.appbuilder.portal.common';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';

export class Create extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Project_Create> {
  async execute(job: Job<BullMQ.Project.Create, number, string>): Promise<number> {
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

      await queues.scriptoria.add(
        `Check status of Project #${response.id}`,
        {
          type: BullMQ.ScriptoriaJobType.Project_Check,
          workflowProjectId: response.id,
          organizationId: projectData.OrganizationId,
          projectId: job.data.projectId
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

export class Check extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Project_Check> {
  async execute(job: Job<BullMQ.Project.Check, number, string>): Promise<number> {
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
        await queues.scriptoria.removeRepeatableByKey(job.repeatJobKey);
        if (response.error) {
          job.log(response.error);
        } else {
          await DatabaseWrites.projects.update(job.data.projectId, {
            WorkflowProjectUrl: response.url
          });
        }
        const projectImport = (
          await prisma.projects.findUnique({
            where: {
              Id: job.data.projectId
            },
            select: {
              ProjectImport: true
            }
          })
        )?.ProjectImport;
        if (projectImport) {
          job.updateProgress(75);
          const productsToCreate: { Name: string; Store: string }[] = JSON.parse(projectImport.ImportData).Products;
          await Promise.all(
            productsToCreate.map(async (p) => {
              const res = await DatabaseWrites.products.create({
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
                // TODO: StoreLanguage?
                WorkflowJobId: 0,
                WorkflowBuildId: 0,
                WorkflowPublishId: 0
              });
              job.log(JSON.stringify({ ...p, result: res }, null, 4));
            })
          );
          job.updateProgress(100);
          return productsToCreate.length;
        }

        job.updateProgress(100);
        return response.id;
      }
      job.updateProgress(100);
      return 0;
    }
  }
}

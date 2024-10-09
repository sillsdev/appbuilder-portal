import {
  BullMQ,
  prisma,
  DatabaseWrites,
  BuildEngine,
  scriptoriaQueue
} from 'sil.appbuilder.portal.common';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';

// TODO: What would be a meaningful return?
export class CreateProject extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.CreateProject> {
  async execute(job: Job<BullMQ.CreateProjectJob, number, string>): Promise<number> {
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
    const response = await BuildEngine.Requests.createProject(projectData.OrganizationId, {
      app_id: projectData.ApplicationType.Name,
      project_name: projectData.Name,
      language_code: projectData.Language,
      storage_type: 's3'
    });
    job.updateProgress(50);
    if (response.responseType === 'error') {
      job.log(response.message);
      throw new Error(`Creation of Project #${job.data.projectId} failed!`);
    } else {
      await DatabaseWrites.projects.update(job.data.projectId, {
        WorkflowProjectId: response.id,
        WorkflowAppProjectUrl: `${process.env.UI_URL ?? 'http://localhost:5173'}/projects/${job.data.projectId}`,
        DateUpdated: new Date()
      });
      job.updateProgress(75);

      await scriptoriaQueue.add(
        `Check status of Project #${response.id}`,
        {
          type: BullMQ.ScriptoriaJobType.CheckCreateProject,
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

export class CheckCreateProject extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.CheckCreateProject> {
  async execute(job: Job<BullMQ.CheckCreateProjectJob, number, string>): Promise<number> {
    const response = await BuildEngine.Requests.getProject(
      job.data.organizationId,
      job.data.workflowProjectId
    );
    job.updateProgress(50);
    if (response.responseType === 'error') {
      job.log(response.message);
      throw new Error(response.message);
    } else {
      if (response.status === 'completed') {
        await scriptoriaQueue.removeRepeatableByKey(job.repeatJobKey);
        if (response.error) {
          job.log(response.error);
        }
        else {
          await DatabaseWrites.projects.update(job.data.projectId, {
            WorkflowProjectUrl: response.url,
            DateUpdated: new Date()
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

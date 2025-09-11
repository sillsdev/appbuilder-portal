import { SpanStatusCode, trace } from '@opentelemetry/api';
import type { Exception, Job } from 'bullmq';
import { Worker } from 'bullmq';
import * as Executor from '../job-executors';
import { getQueues, getWorkerConfig } from './queues';
import * as BullMQ from './types';
import { building } from '$app/environment';
import { SSEPageUpdates } from '$lib/projects/listener';

const tracer = trace.getTracer('BullWorker');

export abstract class BullWorker<T extends BullMQ.Job> {
  public worker?: Worker;
  constructor(public queue: BullMQ.QueueName) {
    if (!building)
      // Leaving out the bind here is the type of issue that TS unfortunately cannot catch
      this.worker = new Worker<T>(queue, this.runInternal.bind(this), getWorkerConfig());
  }
  private async runInternal(job: Job<T>) {
    return await tracer.startActiveSpan(`${job.queueName} - ${job.data.type}`, async (span) => {
      span.setAttributes({
        'job.id': job.id,
        'job.name': job.name,
        'job.queueName': job.queueName,
        'job.type': job.data.type,
        'job.opts': JSON.stringify(job.opts),
        'job.data': JSON.stringify(job.data)
      });
      try {
        return await this.run(job);
      } catch (error) {
        span.recordException(error as Exception);
        span.setStatus({
          code: SpanStatusCode.ERROR, // Error
          message: (error as Error).message
        });
        console.error(error);
      } finally {
        span.end();
      }
    });
  }
  abstract run(job: Job<T>): Promise<unknown>;
}

export class Builds<J extends BullMQ.BuildJob> extends BullWorker<J> {
  constructor() {
    super(BullMQ.QueueName.Builds);
  }
  async run(job: Job<J>) {
    switch (job.data.type) {
      case BullMQ.JobType.Build_Product:
        return Executor.Build.product(job as Job<BullMQ.Build.Product>);
      case BullMQ.JobType.Build_PostProcess:
        return Executor.Build.postProcess(job as Job<BullMQ.Build.PostProcess>);
    }
  }
}

export class SystemRecurring<J extends BullMQ.RecurringJob> extends BullWorker<J> {
  constructor() {
    super(BullMQ.QueueName.System_Recurring);
    getQueues().SystemRecurring.upsertJobScheduler(
      BullMQ.JobSchedulerId.CheckSystemStatuses,
      {
        pattern: '*/5 * * * *', // every 5 minutes
        immediately: false
      },
      {
        name: 'Check System Statuses',
        data: {
          type: BullMQ.JobType.System_CheckEngineStatuses
        }
      }
    );
    getQueues().SystemRecurring.upsertJobScheduler(
      BullMQ.JobSchedulerId.RefreshLangTags,
      {
        pattern: '@daily', // every day at midnight
        immediately: false
      },
      {
        name: 'Refresh LangTags',
        data: {
          type: BullMQ.JobType.System_RefreshLangTags
        }
      }
    );
    getQueues().SystemRecurring.upsertJobScheduler(
      BullMQ.JobSchedulerId.PruneUsers,
      {
        pattern: '@weekly', // every Sunday at midnight
        immediately: false
      },
      {
        name: 'Prune Users without Organization Membership',
        data: {
          type: BullMQ.JobType.System_PruneUsers
        }
      }
    );
  }
  async run(job: Job<J>) {
    switch (job.data.type) {
      case BullMQ.JobType.System_CheckEngineStatuses:
        return Executor.System.checkSystemStatuses(job as Job<BullMQ.System.CheckEngineStatuses>);
      case BullMQ.JobType.System_RefreshLangTags:
        return Executor.System.refreshLangTags(job as Job<BullMQ.System.RefreshLangTags>);
      case BullMQ.JobType.System_PruneUsers:
        return Executor.System.prune(job as Job<BullMQ.System.PruneUsers>);
    }
  }
}

export class SystemStartup<J extends BullMQ.StartupJob> extends BullWorker<J> {
  private jobsLeft = 0;
  constructor() {
    super(BullMQ.QueueName.System_Startup);
    const startupJobs = [
      [
        'Check System Statuses (Startup)',
        {
          type: BullMQ.JobType.System_CheckEngineStatuses
        }
      ],
      [
        'Refresh LangTags (Startup)',
        {
          type: BullMQ.JobType.System_RefreshLangTags
        }
      ],
      [
        'Migrate Features from S1 to S2 (Startup)',
        {
          type: BullMQ.JobType.System_Migrate
        }
      ]
    ] as const;
    startupJobs.forEach(([name, data]) => {
      getQueues().SystemStartup.add(name, data);
    });
    this.jobsLeft = startupJobs.length;
  }
  async run(job: Job<J>) {
    // Close the worker after running the startup jobs
    // This prevents this worker from taking startup jobs when a new instance is started
    // The worker will not actually be closed until all processing jobs are complete
    if (--this.jobsLeft === 0) this.worker?.close();
    switch (job.data.type) {
      case BullMQ.JobType.System_CheckEngineStatuses:
        return Executor.System.checkSystemStatuses(job as Job<BullMQ.System.CheckEngineStatuses>);
      case BullMQ.JobType.System_RefreshLangTags:
        return Executor.System.refreshLangTags(job as Job<BullMQ.System.RefreshLangTags>);
      case BullMQ.JobType.System_Migrate:
        return Executor.System.migrate(job as Job<BullMQ.System.Migrate>);
    }
  }
}

export class Products<J extends BullMQ.ProductJob> extends BullWorker<J> {
  constructor() {
    super(BullMQ.QueueName.Products);
  }
  async run(job: Job<J>) {
    switch (job.data.type) {
      case BullMQ.JobType.Product_Create:
        return Executor.Product.create(job as Job<BullMQ.Product.Create>);
      case BullMQ.JobType.Product_Delete:
        return Executor.Product.deleteProduct(job as Job<BullMQ.Product.Delete>);
      case BullMQ.JobType.Product_GetVersionCode:
        return Executor.Product.getVersionCode(job as Job<BullMQ.Product.GetVersionCode>);
      case BullMQ.JobType.Product_CreateLocal:
        return Executor.Product.createLocal(job as Job<BullMQ.Product.CreateLocal>);
    }
  }
}

export class Projects<J extends BullMQ.ProjectJob> extends BullWorker<J> {
  constructor() {
    super(BullMQ.QueueName.Projects);
  }
  async run(job: Job<J>) {
    switch (job.data.type) {
      case BullMQ.JobType.Project_Create:
        return Executor.Project.create(job as Job<BullMQ.Project.Create>);
      case BullMQ.JobType.Project_ImportProducts:
        return Executor.Project.importProducts(job as Job<BullMQ.Project.ImportProducts>);
    }
  }
}

export class Publishing<J extends BullMQ.PublishJob> extends BullWorker<J> {
  constructor() {
    super(BullMQ.QueueName.Publishing);
  }
  async run(job: Job<J>) {
    switch (job.data.type) {
      case BullMQ.JobType.Publish_Product:
        return Executor.Publish.product(job as Job<BullMQ.Publish.Product>);
      case BullMQ.JobType.Publish_PostProcess:
        return Executor.Publish.postProcess(job as Job<BullMQ.Publish.PostProcess>);
    }
  }
}

export class Polling<J extends BullMQ.PollJob> extends BullWorker<J> {
  constructor() {
    super(BullMQ.QueueName.Polling);
  }
  async run(job: Job<J>) {
    switch (job.data.type) {
      case BullMQ.JobType.Poll_Build:
        return Executor.Polling.build(job as Job<BullMQ.Polling.Build>);
      case BullMQ.JobType.Poll_Publish:
        return Executor.Polling.publish(job as Job<BullMQ.Polling.Publish>);
      case BullMQ.JobType.Poll_Project:
        return Executor.Polling.project(job as Job<BullMQ.Polling.Project>);
    }
  }
}

export class UserTasks<J extends BullMQ.UserTasksJob> extends BullWorker<J> {
  constructor() {
    super(BullMQ.QueueName.UserTasks);
  }
  async run(job: Job<J>) {
    switch (job.data.type) {
      case BullMQ.JobType.UserTasks_Modify:
        return Executor.UserTasks.modify(job as Job<BullMQ.UserTasks.Modify>);
    }
  }
}

export class Emails<J extends BullMQ.EmailJob> extends BullWorker<J> {
  constructor() {
    super(BullMQ.QueueName.Emails);
  }
  async run(job: Job<J>) {
    switch (job.data.type) {
      case BullMQ.JobType.Email_InviteUser:
        return Executor.Email.inviteUser(job as Job<BullMQ.Email.InviteUser>);
      case BullMQ.JobType.Email_SendNotificationToUser:
        return Executor.Email.sendNotificationToUser(
          job as Job<BullMQ.Email.SendNotificationToUser>
        );
      case BullMQ.JobType.Email_SendNotificationToReviewers:
        return Executor.Email.sendNotificationToReviewers(
          job as Job<BullMQ.Email.SendNotificationToReviewers>
        );
      case BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner:
        return Executor.Email.sendNotificationToOrgAdminsAndOwner(
          job as Job<BullMQ.Email.SendNotificationToOrgAdminsAndOwner>
        );
      case BullMQ.JobType.Email_SendBatchUserTaskNotifications:
        return Executor.Email.sendBatchUserTaskNotifications(
          job as Job<BullMQ.Email.SendBatchUserTaskNotifications>
        );
      case BullMQ.JobType.Email_NotifySuperAdminsOfNewOrganizationRequest:
        return Executor.Email.notifySuperAdminsOfNewOrganizationRequest(
          job as Job<BullMQ.Email.NotifySuperAdminsOfNewOrganizationRequest>
        );
      case BullMQ.JobType.Email_NotifySuperAdminsOfOfflineSystems:
        return Executor.Email.notifySuperAdminsOfOfflineSystems(
          job as Job<BullMQ.Email.NotifySuperAdminsOfOfflineSystems>
        );
      case BullMQ.JobType.Email_NotifySuperAdminsLowPriority:
        return Executor.Email.notifySuperAdminsLowPriority(
          job as Job<BullMQ.Email.NotifySuperAdminsLowPriority>
        );
      case BullMQ.JobType.Email_ProjectImportReport:
        return Executor.Email.reportProjectImport(job as Job<BullMQ.Email.ProjectImportReport>);
    }
  }
}

export class SvelteSSE<J extends BullMQ.SvelteSSEJob> extends BullWorker<J> {
  constructor() {
    super(BullMQ.QueueName.SvelteSSE);
  }
  async run(job: Job<J>) {
    switch (job.data.type) {
      case BullMQ.JobType.SvelteSSE_UpdateProject:
        SSEPageUpdates.emit('projectPage', job.data.projectIds);
        break;
      case BullMQ.JobType.SvelteSSE_UpdateUserTasks:
        SSEPageUpdates.emit('userTasksPage', job.data.userIds);
        break;
    }
  }
}

import { Span, trace } from '@opentelemetry/api';
import { Job, Worker } from 'bullmq';
import { BullMQ, Queues } from 'sil.appbuilder.portal.common';
import * as Executor from './job-executors/index.js';

const tracer = trace.getTracer('workers');

export abstract class BullWorker<T> {
  public worker: Worker;
  constructor(public queue: BullMQ.QueueName) {
    this.worker = new Worker<T>(queue, this.run, Queues.config);
  }
  abstract run(job: Job<T>): Promise<unknown>;
}

export class Builds extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.Builds);
  }
  async run(job: Job<BullMQ.Job>) {
    return tracer.startActiveSpan(
      'builds-runner',
      { links: job.data.links },
      async (span: Span) => {
        span.setAttribute('jobType', job.data.type);
        let res: unknown;
        switch (job.data.type) {
          case BullMQ.JobType.Build_Product:
            res = await Executor.Build.product(job as Job<BullMQ.Build.Product>);
            break;
          case BullMQ.JobType.Build_PostProcess:
            res = await Executor.Build.postProcess(job as Job<BullMQ.Build.PostProcess>);
            break;
        }
        span.end();
        return res;
      }
    );
  }
}

export class DefaultRecurring extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.DefaultRecurring);
    tracer.startActiveSpan('system-recurring-init', (span: Span) => {
      Queues.DefaultRecurring.upsertJobScheduler(
        BullMQ.JobSchedulerId.CheckSystemStatuses,
        {
          pattern: '*/5 * * * *', // every 5 minutes
          immediately: true
        },
        {
          name: 'Check System Statuses',
          data: {
            type: BullMQ.JobType.Recurring_CheckSystemStatuses,
            links: [{ context: span.spanContext()}]
          }
        }
      );
      Queues.DefaultRecurring.upsertJobScheduler(
        BullMQ.JobSchedulerId.RefreshLangTags,
        {
          pattern: '@daily', // every day at midnight
          immediately: true
        },
        {
          name: 'Refresh LangTags',
          data: {
            type: BullMQ.JobType.Recurring_RefreshLangTags,
            links: [{ context: span.spanContext()}]
          }
        }
      );
      span.end();
    });
  }
  async run(job: Job<BullMQ.Job>) {
    return tracer.startActiveSpan(
      'system-recurring-runner',
      { links: job.data.links },
      async (span: Span) => {
        span.setAttribute('jobType', job.data.type);
        let res: unknown;
        switch (job.data.type) {
          case BullMQ.JobType.Recurring_CheckSystemStatuses:
            res = await Executor.Recurring.checkSystemStatuses(
              job as Job<BullMQ.Recurring.CheckSystemStatuses>
            );
            break;
          case BullMQ.JobType.Recurring_RefreshLangTags:
            res = await Executor.Recurring.refreshLangTags(
              job as Job<BullMQ.Recurring.RefreshLangTags>
            );
            break;
        }
        span.end();
        return res;
      }
    );
  }
}

export class Miscellaneous extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.Miscellaneous);
  }
  async run(job: Job<BullMQ.Job>) {
    return tracer.startActiveSpan(
      'miscellaneous-runner',
      { links: job.data.links },
      async (span: Span) => {
        span.setAttribute('jobType', job.data.type);
        let res: unknown;
        switch (job.data.type) {
          case BullMQ.JobType.Product_Create:
            res = Executor.Product.create(job as Job<BullMQ.Product.Create>);
            break;
          case BullMQ.JobType.Product_Delete:
            res = Executor.Product.deleteProduct(job as Job<BullMQ.Product.Delete>);
            break;
          case BullMQ.JobType.Product_GetVersionCode:
            res = Executor.Product.getVersionCode(job as Job<BullMQ.Product.GetVersionCode>);
            break;
          case BullMQ.JobType.Project_Create:
            res = Executor.Project.create(job as Job<BullMQ.Project.Create>);
            break;
          case BullMQ.JobType.Project_ImportProducts:
            res = Executor.Project.importProducts(job as Job<BullMQ.Project.ImportProducts>);
            break;
        }
        span.end();
        return res;
      }
    );
  }
}

export class Publishing extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.Publishing);
  }
  async run(job: Job<BullMQ.Job>) {
    return tracer.startActiveSpan(
      'publishing-runner',
      { links: job.data.links },
      async (span: Span) => {
        span.setAttribute('jobType', job.data.type);
        let res: unknown;
        switch (job.data.type) {
          case BullMQ.JobType.Publish_Product:
            res = Executor.Publish.product(job as Job<BullMQ.Publish.Product>);
            break;
          case BullMQ.JobType.Publish_PostProcess:
            res = Executor.Publish.postProcess(job as Job<BullMQ.Publish.PostProcess>);
            break;
        }
        span.end();
        return res;
      }
    );
  }
}

export class RemotePolling extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.RemotePolling);
  }
  async run(job: Job<BullMQ.Job>) {
    return tracer.startActiveSpan(
      'polling-runner',
      { links: job.data.links },
      async (span: Span) => {
        span.setAttribute('jobType', job.data.type);
        let res: unknown;
        switch (job.data.type) {
          case BullMQ.JobType.Build_Check:
            res = Executor.Build.check(job as Job<BullMQ.Build.Check>);
            break;
          case BullMQ.JobType.Publish_Check:
            res = Executor.Publish.check(job as Job<BullMQ.Publish.Check>);
            break;
          case BullMQ.JobType.Project_Check:
            res = Executor.Project.check(job as Job<BullMQ.Project.Check>);
            break;
        }
        span.end();
        return res;
      }
    );
  }
}

export class UserTasks extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.UserTasks);
  }
  async run(job: Job<BullMQ.Job>) {
    return tracer.startActiveSpan(
      'usertasks-runner',
      { links: job.data.links },
      async (span: Span) => {
        span.setAttribute('jobType', job.data.type);
        let res: unknown;
        switch (job.data.type) {
          case BullMQ.JobType.UserTasks_Modify:
            res = Executor.UserTasks.modify(job as Job<BullMQ.UserTasks.Modify>);
            break;
        }
        span.end();
        return res;
      }
    );
  }
}

export class Emails extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.Emails);
  }
  async run(job: Job<BullMQ.Job>) {
    return tracer.startActiveSpan(
      'emails-runner',
      { links: job.data.links },
      async (span: Span) => {
        span.setAttribute('jobType', job.data.type);
        let res: unknown;
        switch (job.data.type) {
          case BullMQ.JobType.Email_InviteUser:
            res = await Executor.Email.inviteUser(job as Job<BullMQ.Email.InviteUser>);
            break;
          case BullMQ.JobType.Email_SendNotificationToUser:
            res = await Executor.Email.sendNotificationToUser(
              job as Job<BullMQ.Email.SendNotificationToUser>
            );
            break;
          case BullMQ.JobType.Email_SendNotificationToReviewers:
            res = await Executor.Email.sendNotificationToReviewers(
              job as Job<BullMQ.Email.SendNotificationToReviewers>
            );
            break;
          case BullMQ.JobType.Email_SendNotificationToOrgAdminsAndOwner:
            res = await Executor.Email.sendNotificationToOrgAdminsAndOwner(
              job as Job<BullMQ.Email.SendNotificationToOrgAdminsAndOwner>
            );
            break;
          case BullMQ.JobType.Email_SendBatchUserTaskNotifications:
            res = await Executor.Email.sendBatchUserTaskNotifications(
              job as Job<BullMQ.Email.SendBatchUserTaskNotifications>
            );
            break;
          case BullMQ.JobType.Email_NotifySuperAdminsOfNewOrganizationRequest:
            res = await Executor.Email.notifySuperAdminsOfNewOrganizationRequest(
              job as Job<BullMQ.Email.NotifySuperAdminsOfNewOrganizationRequest>
            );
            break;
          case BullMQ.JobType.Email_NotifySuperAdminsOfOfflineSystems:
            res = await Executor.Email.notifySuperAdminsOfOfflineSystems(
              job as Job<BullMQ.Email.NotifySuperAdminsOfOfflineSystems>
            );
            break;
          case BullMQ.JobType.Email_NotifySuperAdminsLowPriority:
            res = await Executor.Email.notifySuperAdminsLowPriority(
              job as Job<BullMQ.Email.NotifySuperAdminsLowPriority>
            );
            break;
          case BullMQ.JobType.Email_ProjectImportReport:
            res = await Executor.Email.reportProjectImport(
              job as Job<BullMQ.Email.ProjectImportReport>
            );
            break;
        }
        span.end();
        return res;
      }
    );
  }
}

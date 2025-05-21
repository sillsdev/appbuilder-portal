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
    switch (job.data.type) {
      case BullMQ.JobType.Build_Product:
        return Executor.Build.product(job as Job<BullMQ.Build.Product>);
      case BullMQ.JobType.Build_PostProcess:
        return Executor.Build.postProcess(job as Job<BullMQ.Build.PostProcess>);
    }
  }
}

export class DefaultRecurring extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.DefaultRecurring);
    Queues.DefaultRecurring.upsertJobScheduler(
      BullMQ.JobSchedulerId.CheckSystemStatuses,
      {
        pattern: '*/5 * * * *', // every 5 minutes
        immediately: true
      },
      {
        name: 'Check System Statuses',
        data: {
          type: BullMQ.JobType.Recurring_CheckSystemStatuses
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
          type: BullMQ.JobType.Recurring_RefreshLangTags
        }
      }
    );
  }
  async run(job: Job<BullMQ.Job>) {
    return tracer.startActiveSpan('system-recurring-runner', async (span: Span) => {
      span.setAttribute('jobType', job.data.type);
      let res: unknown;
      switch (job.data.type) {
      case BullMQ.JobType.Recurring_CheckSystemStatuses:
        res = await Executor.Recurring.checkSystemStatuses(
          job as Job<BullMQ.Recurring.CheckSystemStatuses>
        );
        break;
      case BullMQ.JobType.Recurring_RefreshLangTags:
        res = await Executor.Recurring.refreshLangTags(job as Job<BullMQ.Recurring.RefreshLangTags>);
        break;
      }
      span.end();
      return res;
    });
  }
}

export class Miscellaneous extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.Miscellaneous);
  }
  async run(job: Job<BullMQ.Job>) {
    switch (job.data.type) {
      case BullMQ.JobType.Product_Create:
        return Executor.Product.create(job as Job<BullMQ.Product.Create>);
      case BullMQ.JobType.Product_Delete:
        return Executor.Product.deleteProduct(job as Job<BullMQ.Product.Delete>);
      case BullMQ.JobType.Product_GetVersionCode:
        return Executor.Product.getVersionCode(job as Job<BullMQ.Product.GetVersionCode>);
      case BullMQ.JobType.Project_Create:
        return Executor.Project.create(job as Job<BullMQ.Project.Create>);
      case BullMQ.JobType.Project_ImportProducts:
        return Executor.Project.importProducts(job as Job<BullMQ.Project.ImportProducts>);
    }
  }
}

export class Publishing extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.Publishing);
  }
  async run(job: Job<BullMQ.Job>) {
    switch (job.data.type) {
      case BullMQ.JobType.Publish_Product:
        return Executor.Publish.product(job as Job<BullMQ.Publish.Product>);
      case BullMQ.JobType.Publish_PostProcess:
        return Executor.Publish.postProcess(job as Job<BullMQ.Publish.PostProcess>);
    }
  }
}

export class RemotePolling extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.RemotePolling);
  }
  async run(job: Job<BullMQ.Job>) {
    switch (job.data.type) {
      case BullMQ.JobType.Build_Check:
        return Executor.Build.check(job as Job<BullMQ.Build.Check>);
      case BullMQ.JobType.Publish_Check:
        return Executor.Publish.check(job as Job<BullMQ.Publish.Check>);
      case BullMQ.JobType.Project_Check:
        return Executor.Project.check(job as Job<BullMQ.Project.Check>);
    }
  }
}

export class UserTasks extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.UserTasks);
  }
  async run(job: Job<BullMQ.Job>) {
    switch (job.data.type) {
      case BullMQ.JobType.UserTasks_Modify:
        return Executor.UserTasks.modify(job as Job<BullMQ.UserTasks.Modify>);
    }
  }
}

export class Emails extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.Emails);
  }
  async run(job: Job<BullMQ.Job>) {
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

import { Job, Worker } from 'bullmq';
import { BullMQ, Queues } from 'sil.appbuilder.portal.common';
import * as Executor from './job-executors/index.js';

export abstract class BullWorker<T> {
  public worker: Worker;
  constructor(public queue: BullMQ.QueueName) {
    this.worker = new Worker<T>(queue, this.run, {
      connection: {
        host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
      }
    });
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
    Queues.DefaultRecurring.add(
      'Check System Statuses (Recurring)',
      {
        type: BullMQ.JobType.Recurring_CheckSystemStatuses
      },
      {
        repeat: {
          pattern: '*/5 * * * *', // every 5 minutes
          key: 'defaultCheckSystemStatuses'
        }
      }
    );
    Queues.DefaultRecurring.add('Check System Statuses (Startup)', {
      type: BullMQ.JobType.Recurring_CheckSystemStatuses
    });
    Queues.DefaultRecurring.add(
      'Refresh LangTags (Recurring)',
      {
        type: BullMQ.JobType.Recurring_RefreshLangTags
      },
      {
        repeat: {
          pattern: '@daily', // Runs at midnight UTC each day
          key: 'defaultRefreshLangTags'
        }
      }
    );
  }
  async run(job: Job<BullMQ.Job>) {
    switch (job.data.type) {
    case BullMQ.JobType.Recurring_CheckSystemStatuses:
      return Executor.Recurring.checkSystemStatuses(
          job as Job<BullMQ.Recurring.CheckSystemStatuses>
      );
    case BullMQ.JobType.Recurring_RefreshLangTags:
      return Executor.Recurring.refreshLangTags(job as Job<BullMQ.Recurring.RefreshLangTags>);
    }
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

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
    }
  }
}

export class DefaultRecurring extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.DefaultRecurring);
    Queues.DefaultRecurring.add(
      'Check System Statuses (Recurring)',
      {
        type: BullMQ.JobType.System_CheckStatuses
      },
      {
        repeat: {
          pattern: '*/5 * * * *', // every 5 minutes
          key: 'defaultCheckSystemStatuses'
        }
      }
    );
  }
  async run(job: Job<BullMQ.Job>) {
    switch (job.data.type) {
    case BullMQ.JobType.System_CheckStatuses:
      return Executor.System.checkStatuses(job as Job<BullMQ.System.CheckStatuses>);
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

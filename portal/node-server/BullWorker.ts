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

export class UserTasks extends BullWorker<BullMQ.Job> {
  constructor() {
    super(BullMQ.QueueName.UserTasks);
  }
  async run(job: Job<BullMQ.Job>) {
    switch (job.data.type) {
    case BullMQ.JobType.UserTasks_Reassign:
      return Executor.UserTasks.reassign(job as Job<BullMQ.UserTasks.Reassign>);
    }
  }
}

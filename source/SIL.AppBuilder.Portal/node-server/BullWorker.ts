import { Job, Worker } from 'bullmq';
import { BullMQ } from 'sil.appbuilder.portal.common';
import * as Executor from './job-executors/index.js';

export abstract class BullWorker<T, R> {
  public worker: Worker;
  constructor(public queue: BullMQ.QueueName) {
    this.worker = new Worker<T, R>(queue, this.run, {
      connection: {
        host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
      }
    });
  }
  abstract run(job: Job<T, R>): Promise<R>;
}

type JobCast<T extends BullMQ.Job> = Job<T, number, string>;

export class UserTasksWorker extends BullWorker<BullMQ.Job, number> {
  constructor(queue: BullMQ.QueueName) {
    super(queue);
  }
  async run(job: Job<BullMQ.Job, number, string>): Promise<number> {
    switch (job.data.type) {
    case BullMQ.JobType.UserTasks_Reassign:
      return new Executor.UserTasks.Reassign().execute(job as JobCast<BullMQ.UserTasks.Reassign>);
    }
  }
}

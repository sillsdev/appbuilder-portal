import { Job, Worker } from 'bullmq';
import { BullMQ, queues } from 'sil.appbuilder.portal.common';
import * as Executor from './job-executors/index.js';

export abstract class BullWorker<T, R> {
  public worker: Worker;
  constructor(public queue: string) {
    this.worker = new Worker<T, R>(queue, this.run, {
      connection: {
        host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
      }
    });
  }
  abstract run(job: Job<T, R>): Promise<R>;
}

type JobCast<T extends BullMQ.ScriptoriaJob> = Job<T, number, string>;

export class ScriptoriaWorker extends BullWorker<BullMQ.ScriptoriaJob, number> {
  constructor(queue: queues.QueueName) {
    super(queue);
  }
  async run(job: Job<BullMQ.ScriptoriaJob, number, string>): Promise<number> {
    switch (job.data.type) {
      case BullMQ.ScriptoriaJobType.Test:
        return new Executor.Test().execute(job as JobCast<BullMQ.Test>);
      case BullMQ.ScriptoriaJobType.UserTasks_Reassign:
        return new Executor.UserTasks.Reassign().execute(job as JobCast<BullMQ.UserTasks.Reassign>);
    }
  }
}

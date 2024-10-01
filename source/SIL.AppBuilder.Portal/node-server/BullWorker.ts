import { Job, Worker } from 'bullmq';
import { BullMQ } from 'sil.appbuilder.portal.common';
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

export class ScriptoriaWorker extends BullWorker<BullMQ.ScriptoriaJob, number> {
  constructor() {
    super('scriptoria');
  }
  async run(job: Job<BullMQ.ScriptoriaJob, number, string>): Promise<number> {
    switch (job.data.type) {
      case BullMQ.ScriptoriaJobType.Test:
        return new Executor.Test().execute(job as Job<BullMQ.TestJob, number, string>);
      case BullMQ.ScriptoriaJobType.ReassignUserTasks:
        return new Executor.ReassignUserTasks().execute(
          job as Job<BullMQ.SyncUserTasksJob, number, string>
        );
    }
  }
}

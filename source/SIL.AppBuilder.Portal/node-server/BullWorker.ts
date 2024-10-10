import { Job, Worker } from 'bullmq';
import { BullMQ, scriptoriaQueue } from 'sil.appbuilder.portal.common';
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
  constructor() {
    super('scriptoria');
  }
  async run(job: Job<BullMQ.ScriptoriaJob, number, string>): Promise<number> {
    switch (job.data.type) {
      case BullMQ.ScriptoriaJobType.Build_Product:
        return new Executor.Build.Product().execute(job as JobCast<BullMQ.Build.Product>);
      case BullMQ.ScriptoriaJobType.Build_Check:
        return new Executor.Build.Check().execute(job as JobCast<BullMQ.Build.Check>);
      case BullMQ.ScriptoriaJobType.Notify_Reviewers:
        return new Executor.Notify.Reviewers().execute(job as JobCast<BullMQ.Notify.Reviewers>);
      case BullMQ.ScriptoriaJobType.Product_Create:
        return new Executor.Product.Create().execute(job as JobCast<BullMQ.Product.Create>);
      case BullMQ.ScriptoriaJobType.Project_Create:
        return new Executor.Project.Create().execute(job as JobCast<BullMQ.Project.Create>);
      case BullMQ.ScriptoriaJobType.Project_Check:
        return new Executor.Project.Check().execute(job as JobCast<BullMQ.Project.Check>);
      case BullMQ.ScriptoriaJobType.Publish_Product:
        return new Executor.Publish.Product().execute(job as JobCast<BullMQ.Publish.Product>);
      case BullMQ.ScriptoriaJobType.Publish_Check:
        return new Executor.Publish.Check().execute(job as JobCast<BullMQ.Publish.Check>);
      case BullMQ.ScriptoriaJobType.System_CheckStatuses:
        return new Executor.System.CheckStatuses().execute(
          job as JobCast<BullMQ.System.CheckStatuses>
        );
      case BullMQ.ScriptoriaJobType.Test:
        return new Executor.Test().execute(job as JobCast<BullMQ.Test>);
      case BullMQ.ScriptoriaJobType.UserTasks_Modify:
        return new Executor.UserTasks.Modify().execute(job as JobCast<BullMQ.UserTasks.Modify>);
    }
  }
}

export function addDefaultRecurringJobs() {
  // Recurring job to check the availability of BuildEngine
  scriptoriaQueue.add(
    'Check System Statuses (Recurring)',
    {
      type: BullMQ.ScriptoriaJobType.System_CheckStatuses
    },
    {
      repeat: {
        pattern: '*/5 * * * *', // every 5 minutes
        key: 'defaultCheckSystemStatuses'
      }
    }
  );
}

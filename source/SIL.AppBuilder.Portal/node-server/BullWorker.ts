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
      case BullMQ.ScriptoriaJobType.CreateProduct:
        return new Executor.CreateProduct().execute(
          job as Job<BullMQ.CreateProductJob, number, string>
        );
      case BullMQ.ScriptoriaJobType.BuildProduct:
        return new Executor.BuildProduct().execute(
          job as Job<BullMQ.BuildProductJob, number, string>
        );
      case BullMQ.ScriptoriaJobType.PublishProduct:
        return new Executor.PublishProduct().execute(
          job as Job<BullMQ.PublishProductJob, number, string>
        );
      case BullMQ.ScriptoriaJobType.EmailReviewers:
        return new Executor.EmailReviewers().execute(
          job as Job<BullMQ.EmailReviewersJob, number, string>
        );
      case BullMQ.ScriptoriaJobType.CheckBuildProduct:
        return new Executor.CheckBuildProduct().execute(
          job as Job<BullMQ.CheckBuildProductJob, number, string>
        );
      case BullMQ.ScriptoriaJobType.CheckPublishProduct:
        return new Executor.CheckPublishProduct().execute(
          job as Job<BullMQ.CheckPublishProductJob, number, string>
        );
      case BullMQ.ScriptoriaJobType.CheckSystemStatuses:
        return new Executor.CheckSystemStatuses().execute(
          job as Job<BullMQ.CheckSystemStatusesJob, number, string>
        );
      case BullMQ.ScriptoriaJobType.CreateProject:
        return new Executor.CreateProject().execute(
          job as Job<BullMQ.CreateProjectJob, number, string>
        );
      case BullMQ.ScriptoriaJobType.CheckCreateProject:
        return new Executor.CheckCreateProject().execute(
          job as Job<BullMQ.CheckCreateProjectJob, number, string>
        );
    }
  }
}

export function addDefaultRecurringJobs() {
  // Recurring job to check the availability of BuildEngine
  scriptoriaQueue.add(
    'Check System Statuses (Recurring)',
    {
      type: BullMQ.ScriptoriaJobType.CheckSystemStatuses
    },
    {
      repeat: {
        pattern: '*/5 * * * *', // every 5 minutes
        key: 'defaultCheckSystemStatuses'
      }
    }
  );
}

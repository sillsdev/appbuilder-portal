import { Job, Worker } from 'bullmq';
import { prisma } from 'sil.appbuilder.portal.common';
import { ScriptoriaJob, ScriptoriaJobType } from 'sil.appbuilder.portal.common/BullJobTypes.js';

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

export class ScriptoriaWorker extends BullWorker<ScriptoriaJob, number> {
  constructor() {
    super('scriptoria');
  }
  async run(job: Job<ScriptoriaJob, number, string>): Promise<number> {
    switch (job.data.type) {
    case ScriptoriaJobType.Test: {
      job.updateProgress(50);
      const time = job.data.time;
      await new Promise((r) => setTimeout(r, 1000 * time));
      job.updateProgress(100);
      return 0;
    }
    case ScriptoriaJobType.ReassignUserTasks:
      // TODO: Noop
      // Should
      // Clear preexecuteentries (product transition steps)
      // Remove relevant user tasks
      // Create new user tasks (send notifications)
      // Recreate preexecute entries
      return (
        await prisma.userTasks.findMany({
          where: {
            Product: {
              ProjectId: job.data.projectId
            }
          }
        })
      ).length;
    }
  }
}

import { BullMQ } from 'sil.appbuilder.portal.common';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';

export class Test extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Test> {
  async execute(job: Job<BullMQ.Test, number, string>): Promise<number> {
    job.updateProgress(50);
    const time = job.data.time;
    await new Promise((r) => setTimeout(r, 1000 * time));
    job.updateProgress(100);
    return 0;
  }
}

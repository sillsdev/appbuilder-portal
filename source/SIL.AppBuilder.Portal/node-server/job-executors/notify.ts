import { BullMQ } from 'sil.appbuilder.portal.common';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';

export class Reviewers extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.Notify_Reviewers> {
  async execute(job: Job<BullMQ.Notify.Reviewers, number, string>): Promise<number> {
    // TODO: send emails (there is currently no integrated service with which to do so)
    return 0;
  }
}

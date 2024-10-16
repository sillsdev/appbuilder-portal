import { BullMQ } from 'sil.appbuilder.portal.common';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';

export class EmailReviewers extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.EmailReviewers> {
  async execute(job: Job<BullMQ.EmailReviewersJob, number, string>): Promise<number> {
    // TODO: send emails (there is currently no integrated service with which to do so)
    return 0;
  }
}
import { Job } from 'bullmq';
import { BullMQ } from 'sil.appbuilder.portal.common';

export abstract class ScriptoriaJobExecutor<T extends BullMQ.JobType> {
  constructor() {}
  abstract execute(job: Job<BullMQ.JobTypeMap[T], number, string>): Promise<unknown>;
}

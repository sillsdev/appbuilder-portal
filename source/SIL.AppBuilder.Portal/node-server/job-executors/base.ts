import { BullMQ } from 'sil.appbuilder.portal.common';
import { Job } from 'bullmq';

export abstract class ScriptoriaJobExecutor<T extends BullMQ.ScriptoriaJobType> {
  constructor() {}
  abstract execute(job: Job<BullMQ.JobTypeMap[T], number, string>): Promise<number>;
}

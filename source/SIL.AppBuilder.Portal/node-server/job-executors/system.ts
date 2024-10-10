import { BullMQ, prisma } from 'sil.appbuilder.portal.common';
import { Job } from 'bullmq';
import { ScriptoriaJobExecutor } from './base.js';

export class CheckStatuses extends ScriptoriaJobExecutor<BullMQ.ScriptoriaJobType.System_CheckStatuses> {
  async execute(job: Job<BullMQ.System.CheckStatuses, number, string>): Promise<number> {
    // TODO: Do I use the `SystemStatus` table? Why does this table even exist? It mostly duplicates data from `Organizations` but is completely disconnected from `Organizations`. Can these be consolidated?
    const systems = await prisma.systemStatuses.findMany();
    job.updateProgress(10);
    //const timestamp = new Date();
    systems.forEach((s, i) => {
      // TODO: Not doing anything here until above TODO is resolved
      job.updateProgress(10 + ((i + 1) * 80) / systems.length);
    });
    //await prisma.$transaction(systems.map());
    job.updateProgress(100);
    return systems.length;
  }
}

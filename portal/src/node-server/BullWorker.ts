import { Job, Worker } from 'bullmq';

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

interface ScriptoriaData {
  date: string;
}

export class ScriptoriaWorker extends BullWorker<ScriptoriaData, number> {
  constructor() {
    super('scriptoria');
  }
  async run(job: Job<ScriptoriaData, number, string>): Promise<number> {
    console.log('starting job ' + job.id + ' (' + job.name + ')');
    job.updateProgress(50);
    await new Promise((r) => setTimeout(r, 10000));
    console.log('finished job ' + job.id + ' (' + job.name + ')');
    return (Date.now() - new Date(job.data.date).getTime()) / 1000;
  }
}

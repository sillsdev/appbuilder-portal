import { Queue } from 'bullmq';
import type { ScriptoriaJob } from './BullJobTypes.js';

export const scriptoriaQueue = new Queue<ScriptoriaJob>('scriptoria', {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

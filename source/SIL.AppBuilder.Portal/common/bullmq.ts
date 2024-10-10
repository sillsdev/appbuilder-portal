import { Queue } from 'bullmq';
import type { ScriptoriaJob } from './BullJobTypes.js';

export const scriptoria = new Queue<ScriptoriaJob>('scriptoria', {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

export const default_recurring = new Queue<ScriptoriaJob>('default recurring', {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

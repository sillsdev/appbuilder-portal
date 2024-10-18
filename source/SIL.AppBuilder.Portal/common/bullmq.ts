import { Queue } from 'bullmq';
import type { ScriptoriaJob } from './BullJobTypes.js';

export type QueueName = 'scriptoria' | 'default recurring';

export const scriptoria = new Queue<ScriptoriaJob>('scriptoria' as QueueName, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

export const default_recurring = new Queue<ScriptoriaJob>('default recurring' as QueueName, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

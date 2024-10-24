import { Queue } from 'bullmq';
import type { ScriptoriaJob } from './BullJobTypes.js';

export enum QueueName {
  Scriptoria = 'scriptoria',
  DefaultRecurring = 'default recurring'
};

export const scriptoria = new Queue<ScriptoriaJob>(QueueName.Scriptoria, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

export const default_recurring = new Queue<ScriptoriaJob>(QueueName.DefaultRecurring, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

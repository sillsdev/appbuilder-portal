import { Queue } from 'bullmq';
import type { ScriptoriaJob } from './BullJobTypes.js';

export enum QueueName {
  Simple = 'simple',
  DefaultRecurring = 'default recurring',
  RemotePolling = 'remote polling'
};

export const simple = new Queue<ScriptoriaJob>(QueueName.Simple, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

export const default_recurring = new Queue<ScriptoriaJob>(QueueName.DefaultRecurring, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

export const remote_polling = new Queue<ScriptoriaJob>(QueueName.RemotePolling, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});


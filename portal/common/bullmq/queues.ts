import { Queue } from 'bullmq';
import type { Job } from './types.js';
import { QueueName } from './types.js';

/** Queue for default recurring jobs such as the BuildEngine status check */
export const DefaultRecurring = new Queue<Job>(QueueName.DefaultRecurring, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});
/** Queue for operations on UserTasks */
export const UserTasks = new Queue<Job>(QueueName.UserTasks, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

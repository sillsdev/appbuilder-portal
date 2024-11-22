import { Queue } from 'bullmq';
import type { Job } from './types.js';
import { QueueName } from './types.js';

/** Queue for operations on UserTasks */
export const UserTasks = new Queue<Job>(QueueName.UserTasks, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

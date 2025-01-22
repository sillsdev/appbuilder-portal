import { Queue } from 'bullmq';
import type { Job } from './types.js';
import { QueueName } from './types.js';

/** Queue for Product Builds */
export const Builds = new Queue<Job>(QueueName.Builds, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});
/** Queue for default recurring jobs such as the BuildEngine status check */
export const DefaultRecurring = new Queue<Job>(QueueName.DefaultRecurring, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});
/** Queue for miscellaneous jobs such as Product and Project Creation */
export const Miscellaneous = new Queue<Job>(QueueName.Miscellaneous, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});
/** Queue for Product Publishing  */
export const Publishing = new Queue<Job>(QueueName.Publishing, {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});
/** Queue for jobs that poll BuildEngine, such as checking the status of a build */
export const RemotePolling = new Queue<Job>(QueueName.RemotePolling, {
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

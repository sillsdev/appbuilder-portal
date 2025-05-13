import { Queue } from 'bullmq';
import type { Job } from './types.js';
import { QueueName } from './types.js';

const connection = {
  host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
};

/** Queue for Product Builds */
export const Builds = new Queue<Job>(QueueName.Builds, { connection });
/** Queue for default recurring jobs such as the BuildEngine status check */
export const DefaultRecurring = new Queue<Job>(QueueName.DefaultRecurring, { connection });
/** Queue for miscellaneous jobs such as Product and Project Creation */
export const Miscellaneous = new Queue<Job>(QueueName.Miscellaneous, { connection });
/** Queue for Product Publishing  */
export const Publishing = new Queue<Job>(QueueName.Publishing, { connection });
/** Queue for jobs that poll BuildEngine, such as checking the status of a build */
export const RemotePolling = new Queue<Job>(QueueName.RemotePolling, { connection });
/** Queue for operations on UserTasks */
export const UserTasks = new Queue<Job>(QueueName.UserTasks, { connection });
/** Queue for Email tasks */
export const EmailTasks = new Queue<Job>(QueueName.Email, { connection });

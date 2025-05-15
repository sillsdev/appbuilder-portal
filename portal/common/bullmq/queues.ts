import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import type { Job } from './types.js';
import { QueueName } from './types.js';

export const connection = {
  host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
} as const;

class Connection {
  private conn: Redis;
  private connected: boolean;
  constructor() {
    this.conn = new Redis(connection);
    this.connected = false;
    this.conn.on('close', () => (this.connected = false));
    this.conn.on('connect', () => (this.connected = true));
    setInterval(() => {
      if (this.connected) {
        this.conn
          .ping()
          .then(() => {
            this.connected = true;
          })
          .catch((err) => {
            console.error(err);
            console.log('Redis disconnected');
            this.connected = false;
          });
      }
    }, 10000); // Check every 10 seconds
  }
  public IsConnected() {
    return this.connected;
  }
}

const conn = new Connection();

export const connected = () => conn.IsConnected();

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
export const Emails = new Queue<Job>(QueueName.Emails, { connection });

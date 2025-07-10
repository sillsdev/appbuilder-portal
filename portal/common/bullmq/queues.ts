import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import type {
  BuildJob,
  EmailJob,
  MiscJob,
  PollJob,
  PublishJob,
  RecurringJob,
  StartupJob,
  SvelteSSEJob,
  UserTasksJob
} from './types.js';
import { QueueName } from './types.js';

class Connection {
  private conn: Redis;
  private connected: boolean;
  constructor() {
    this.conn = new Redis({
      host: process.env.NODE_ENV === 'development' ? 'localhost' : 'valkey',
      maxRetriesPerRequest: null
    });
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
            console.log('Valkey disconnected');
            this.connected = false;
          });
      }
    }, 10000); // Check every 10 seconds
  }
  public IsConnected() {
    return this.connected;
  }

  public connection() {
    return this.conn;
  }
}

const connection = new Connection();

export const connected = () => connection.IsConnected();

export const config = { connection: connection.connection() } as const;

/** Queue for Product Builds */
export const Builds = new Queue<BuildJob>(QueueName.Builds, config);
/** Queue for default recurring jobs such as the BuildEngine status check */
export const SystemRecurring = new Queue<RecurringJob>(QueueName.SystemRecurring, config);
/** Queue for system jobs that run on startup, such as prepopulating langtags.json */
export const SystemStartup = new Queue<StartupJob>(QueueName.SystemStartup, config);
/** Queue for miscellaneous jobs such as Product and Project Creation */
export const Miscellaneous = new Queue<MiscJob>(QueueName.Miscellaneous, config);
/** Queue for Product Publishing  */
export const Publishing = new Queue<PublishJob>(QueueName.Publishing, config);
/** Queue for jobs that poll BuildEngine, such as checking the status of a build */
export const RemotePolling = new Queue<PollJob>(QueueName.RemotePolling, config);
/** Queue for operations on UserTasks */
export const UserTasks = new Queue<UserTasksJob>(QueueName.UserTasks, config);
/** Queue for Email tasks */
export const Emails = new Queue<EmailJob>(QueueName.Emails, config);
/** Queue for Svelte SSE Project events */
export const SvelteProjectSSE = new Queue<SvelteSSEJob>(QueueName.SvelteProjectSSE, config);

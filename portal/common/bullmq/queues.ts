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
      host: process.env.NODE_ENV === 'development' ? 'localhost' : 'valkey'
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

let _connection: Connection | undefined = undefined;

export const connected = () => _connection?.IsConnected() ?? false;

export const getConfig = () => {
  if (!_connection) _queues = createQueues();
  return { connection: _connection!.connection() } as const;
};
let _queues: ReturnType<typeof createQueues> | undefined = undefined;

function createQueues() {
  console.log('CREATING QUEUES');
  if (!_connection) {
    _connection = new Connection();
  }
  /** Queue for Product Builds */
  const Builds = new Queue<BuildJob>(QueueName.Builds, getConfig());
  /** Queue for default recurring jobs such as the BuildEngine status check */
  const SystemRecurring = new Queue<RecurringJob>(QueueName.SystemRecurring, getConfig());
  /** Queue for system jobs that run on startup, such as prepopulating langtags.json */
  const SystemStartup = new Queue<StartupJob>(QueueName.SystemStartup, getConfig());
  /** Queue for miscellaneous jobs such as Product and Project Creation */
  const Miscellaneous = new Queue<MiscJob>(QueueName.Miscellaneous, getConfig());
  /** Queue for Product Publishing  */
  const Publishing = new Queue<PublishJob>(QueueName.Publishing, getConfig());
  /** Queue for jobs that poll BuildEngine, such as checking the status of a build */
  const RemotePolling = new Queue<PollJob>(QueueName.RemotePolling, getConfig());
  /** Queue for operations on UserTasks */
  const UserTasks = new Queue<UserTasksJob>(QueueName.UserTasks, getConfig());
  /** Queue for Email tasks */
  const Emails = new Queue<EmailJob>(QueueName.Emails, getConfig());
  /** Queue for Svelte SSE Project events */
  const SvelteProjectSSE = new Queue<SvelteSSEJob>(QueueName.SvelteProjectSSE, getConfig());
  return {
    Builds,
    SystemRecurring,
    SystemStartup,
    Miscellaneous,
    Publishing,
    RemotePolling,
    UserTasks,
    Emails,
    SvelteProjectSSE
  };
}
export function getQueues() {
  if (!_queues) {
    _queues = createQueues();
  }
  return _queues;
}

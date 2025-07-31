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
} from './types';
import { QueueName } from './types';
import OTEL from '$lib/otel';

class Connection {
  private conn: Redis;
  private connected: boolean;
  constructor(isQueueConnection = false) {
    this.conn = new Redis({
      host: process.env.NODE_ENV === 'development' ? 'localhost' : 'valkey',
      maxRetriesPerRequest: isQueueConnection ? undefined : null
    });
    this.connected = false;
    this.conn.on('close', () => {
      OTEL.instance.logger.info('Valkey connection closed', {
        isQueueConnection
      });
      this.connected = false;
    });
    this.conn.on('connect', () => {
      OTEL.instance.logger.info('Valkey connection established', {
        isQueueConnection
      });
      this.connected = true;
    });
    this.conn.on('error', (err) => {
      OTEL.instance.logger.error('Valkey connection error', {
        error: err.message,
        isQueueConnection
      });
      this.connected = false;
      if (err.message.includes('ENOTFOUND')) {
        console.error('Fatal Valkey connection', err);
        process.exit(1);
      } else if (!err.message.includes('ECONNREFUSED')) {
        console.error('Valkey connection error', err);
      }
    });
    setInterval(() => {
      if (this.connected) {
        this.conn
          .ping()
          .then(() => {
            this.connected = true;
          })
          .catch((err) => {
            if (this.connected) {
              console.error(err);
              console.log('Valkey disconnected');
              this.connected = false;
              OTEL.instance.logger.error('Valkey disconnected', {
                error: err.message,
                isQueueConnection
              });
            }
          });
      }
    }, 10000).unref(); // Check every 10 seconds
  }
  public IsConnected() {
    return this.connected;
  }

  public connection() {
    return this.conn;
  }
}

let _workerConnection: Connection | undefined = undefined;
let _queueConnection: Connection | undefined = undefined;

export const QueueConnected = () => _queueConnection?.IsConnected() ?? false;

export const getWorkerConfig = () => {
  if (!_workerConnection) _workerConnection = new Connection(false);
  return { connection: _workerConnection!.connection() } as const;
};

export const getQueueConfig = () => {
  if (!_queueConnection) _queues = createQueues();
  return { connection: _queueConnection!.connection() } as const;
};
let _queues: ReturnType<typeof createQueues> | undefined = undefined;

function createQueues() {
  if (!_queueConnection) {
    _queueConnection = new Connection(true);
  }
  /** Queue for Product Builds */
  const Builds = new Queue<BuildJob>(QueueName.Builds, getQueueConfig());
  /** Queue for default recurring jobs such as the BuildEngine status check */
  const SystemRecurring = new Queue<RecurringJob>(QueueName.SystemRecurring, getQueueConfig());
  /** Queue for system jobs that run on startup, such as prepopulating langtags.json */
  const SystemStartup = new Queue<StartupJob>(QueueName.SystemStartup, getQueueConfig());
  /** Queue for miscellaneous jobs such as Product and Project Creation */
  const Miscellaneous = new Queue<MiscJob>(QueueName.Miscellaneous, getQueueConfig());
  /** Queue for Product Publishing  */
  const Publishing = new Queue<PublishJob>(QueueName.Publishing, getQueueConfig());
  /** Queue for jobs that poll BuildEngine, such as checking the status of a build */
  const RemotePolling = new Queue<PollJob>(QueueName.RemotePolling, getQueueConfig());
  /** Queue for operations on UserTasks */
  const UserTasks = new Queue<UserTasksJob>(QueueName.UserTasks, getQueueConfig());
  /** Queue for Email tasks */
  const Emails = new Queue<EmailJob>(QueueName.Emails, getQueueConfig());
  /** Queue for Svelte SSE Project events */
  const SvelteSSE = new Queue<SvelteSSEJob>(QueueName.SvelteSSE, getQueueConfig());
  return {
    Builds,
    SystemRecurring,
    SystemStartup,
    Miscellaneous,
    Publishing,
    RemotePolling,
    UserTasks,
    Emails,
    SvelteSSE
  };
}
export function getQueues() {
  if (!_queues) {
    _queues = createQueues();
  }
  return _queues;
}

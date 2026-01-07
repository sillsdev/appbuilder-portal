import { Queue, type QueueOptions } from 'bullmq';
import { BullMQOtel } from 'bullmq-otel';
import { Redis } from 'ioredis';
import type {
  BuildJob,
  EmailJob,
  PollJob,
  ProductJob,
  ProjectJob,
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
      host: process.env.NODE_ENV === 'development' ? 'localhost' : process.env.VALKEY_HOST,
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
let _authConnection: Connection | undefined = undefined;

export const QueueConnected = () => _queueConnection?.IsConnected() ?? false;

export const getAuthConnection = () => {
  if (!_authConnection) _authConnection = new Connection(false);
  return _authConnection.connection();
};

export const getWorkerConfig = () => {
  if (!_workerConnection) _workerConnection = new Connection(false);
  return {
    connection: _workerConnection!.connection(),
    prefix: 'scriptoria',
    telemetry: new BullMQOtel('scriptoria')
  } as const;
};

export const getQueueConfig = () => {
  if (!_queueConnection) _queues = createQueues();
  return {
    connection: _queueConnection!.connection(),
    prefix: 'scriptoria',
    telemetry: new BullMQOtel('scriptoria'),
    defaultJobOptions: {
      // https://docs.bullmq.io/guide/queues/auto-removal-of-jobs#keep-a-certain-number-of-jobs
      removeOnComplete: {
        // 2 weeks
        age: 2 * 7 * 24 * 60 * 60,
        count: 1000
      },
      removeOnFail: {
        // 2 weeks
        age: 2 * 7 * 24 * 60 * 60,
        count: 2000
      }
    }
  } as QueueOptions;
};
let _queues: ReturnType<typeof createQueues> | undefined = undefined;

function createQueues() {
  if (!_queueConnection) {
    _queueConnection = new Connection(true);
  }
  /** Queue for Product Builds */
  const Builds = new Queue<BuildJob>(QueueName.Builds, getQueueConfig());
  /** Queue for default recurring jobs such as the BuildEngine status check */
  const SystemRecurring = new Queue<RecurringJob>(QueueName.System_Recurring, getQueueConfig());
  /** Queue for system jobs that run on startup, such as prepopulating langtags.json */
  const SystemStartup = new Queue<StartupJob>(QueueName.System_Startup, getQueueConfig());
  /** Queue for miscellaneous jobs such as getting a VersionCode or importing products */
  const Products = new Queue<ProductJob>(QueueName.Products, getQueueConfig());
  /** Queue for miscellaneous jobs in BuildEngine such as Product and Project Creation */
  const Projects = new Queue<ProjectJob>(QueueName.Projects, getQueueConfig());
  /** Queue for Product Publishing  */
  const Publishing = new Queue<PublishJob>(QueueName.Publishing, getQueueConfig());
  /** Queue for jobs that poll BuildEngine, such as checking the status of a build */
  const Polling = new Queue<PollJob>(QueueName.Polling, getQueueConfig());
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
    Products,
    Projects,
    Publishing,
    Polling,
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

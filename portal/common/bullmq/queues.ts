import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import OTEL from '../otel.js';
import type { Job } from './types.js';
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
    this.conn.on('close', () => {
      OTEL.instance.logger.info('valkey connection closed');
      this.connected = false;
    });
    this.conn.on('connect', () => {
      OTEL.instance.logger.info('valkey connection opened');
      this.connected = true;
    });
    setInterval(() => {
      if (this.connected) {
        this.conn
          .ping()
          .then(() => {
            this.connected = true;
          })
          .catch((e) => {
            if (this.connected) {
              this.connected = false;
              OTEL.instance.logger.info('valkey could not be reached');
              OTEL.instance.logger.error(
                `RedisConnection: ${typeof e === 'string' ? e.toUpperCase() : e instanceof Error ? e.message : e}`
              );
            }
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
export const Builds = new Queue<Job>(QueueName.Builds, config);
/** Queue for default recurring jobs such as the BuildEngine status check */
export const DefaultRecurring = new Queue<Job>(QueueName.DefaultRecurring, config);
/** Queue for miscellaneous jobs such as Product and Project Creation */
export const Miscellaneous = new Queue<Job>(QueueName.Miscellaneous, config);
/** Queue for Product Publishing  */
export const Publishing = new Queue<Job>(QueueName.Publishing, config);
/** Queue for jobs that poll BuildEngine, such as checking the status of a build */
export const RemotePolling = new Queue<Job>(QueueName.RemotePolling, config);
/** Queue for operations on UserTasks */
export const UserTasks = new Queue<Job>(QueueName.UserTasks, config);
/** Queue for Email tasks */
export const Emails = new Queue<Job>(QueueName.Emails, config);

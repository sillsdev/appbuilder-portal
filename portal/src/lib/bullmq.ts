import { Queue } from 'bullmq';

export const scriptoriaQueue = new Queue('scriptoria', {
  connection: {
    host: 'redis'
  }
});

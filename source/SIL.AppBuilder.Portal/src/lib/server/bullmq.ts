import { Queue } from 'bullmq';

export const scriptoriaQueue = new Queue('scriptoria', {
  connection: {
    host: process.env.NODE_ENV === 'development' ? 'localhost' : 'redis'
  }
});

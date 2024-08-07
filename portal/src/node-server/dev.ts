import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import express from 'express';
import { ScriptoriaWorker } from './BullWorker.js';

process.env.NODE_ENV = 'development';

const app = express();

const jobQueue = new Queue('scriptoria');
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');
createBullBoard({
  queues: [new BullAdapter(jobQueue)],
  serverAdapter
});
app.use(serverAdapter.getRouter());
app.listen(3000, () => console.log('Dev server started'));

new ScriptoriaWorker();

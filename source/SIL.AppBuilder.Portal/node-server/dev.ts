import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import express from 'express';
import { UserTasksWorker } from './BullWorker.js';

process.env.NODE_ENV = 'development';

const app = express();

import { BullMQ } from 'sil.appbuilder.portal.common';
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');
createBullBoard({
  queues: Object.values(BullMQ.QueueName).map((q) => new BullAdapter(q)),
  serverAdapter
});
app.use(serverAdapter.getRouter());
app.listen(3000, () => console.log('Dev server started'));


new UserTasksWorker(BullMQ.QueueName.UserTasks);

import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import express from 'express';
import * as Workers from './BullWorker.js';

process.env.NODE_ENV = 'development';

const app = express();

import { Queues } from 'sil.appbuilder.portal.common';
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');
createBullBoard({
  queues: Object.values(Queues).map((q) => new BullMQAdapter(q)),
  serverAdapter
});
app.use(serverAdapter.getRouter());
app.listen(3000, () => console.log('Dev server started'));

new Workers.Builds();
new Workers.DefaultRecurring();
new Workers.Miscellaneous();
new Workers.Publishing();
new Workers.RemotePolling();
new Workers.UserTasks();

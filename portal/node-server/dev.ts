import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import express from 'express';
import { OTEL, Queues } from 'sil.appbuilder.portal.common';
import * as Workers from './BullWorker.js';

process.env.NODE_ENV = 'development';

OTEL.getInstance().start();

const app = express();

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');
createBullBoard({
  queues: Object.values(Queues)
    .filter((q) => q instanceof Queue)
    .map((q) => new BullMQAdapter(q)),
  serverAdapter
});
app.use(serverAdapter.getRouter());

// Dev server uses port 6100 becuase 6173 is used by vite
app.listen(6100, () => console.log('Dev server started'));

new Workers.Builds();
new Workers.DefaultRecurring();
new Workers.Miscellaneous();
new Workers.Publishing();
new Workers.RemotePolling();
new Workers.UserTasks();
new Workers.Emails();

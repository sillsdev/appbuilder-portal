import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import express from 'express';
import { ScriptoriaWorker } from './BullWorker.js';

process.env.NODE_ENV = 'development';

const app = express();

import { queues } from 'sil.appbuilder.portal.common';
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/');
createBullBoard({
  queues: [new BullAdapter(queues.scriptoria), new BullAdapter(queues.default_recurring)],
  serverAdapter
});
app.use(serverAdapter.getRouter());
app.listen(3000, () => console.log('Dev server started'));

new ScriptoriaWorker(queues.QueueName.Scriptoria);
new ScriptoriaWorker(queues.QueueName.DefaultRecurring);

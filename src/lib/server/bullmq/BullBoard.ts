import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { HonoAdapter } from '@bull-board/hono';
import { serveStatic } from '@hono/node-server/serve-static';
import type { Handle } from '@sveltejs/kit';
import { Queue } from 'bullmq';
import { Hono } from 'hono';
import { createRequire } from 'module';
import path from 'path';
import { getQueues } from './queues';

// This is a full Hono app that serves the BullBoard UI
// Unfortunately this is the only way to setup BullBoard
// within SvelteKit, but Hono is extremely lightweight
const bullboard = (() => {
  const app = new Hono({ strict: false });
  const serverAdapter = new HonoAdapter(serveStatic);
  serverAdapter.setBasePath('/admin/jobs');

  createBullBoard({
    queues: Object.values(getQueues())
      .filter((q) => q instanceof Queue)
      .map((q) => new BullMQAdapter(q)),
    serverAdapter,
    options: {
      uiBasePath: path.dirname(
        createRequire(import.meta.url).resolve('@bull-board/ui/package.json')
      )
    }
  });

  app.route('/admin/jobs', serverAdapter.registerPlugin());

  return app;
})();

export const bullboardHandle: Handle = async ({ event, resolve }) => {
  if (event.request.method === 'GET' && event.url.pathname.match(/^\/admin\/jobs($|\/)/)) {
    return bullboard.fetch(event.request);
  }
  return resolve(event);
};

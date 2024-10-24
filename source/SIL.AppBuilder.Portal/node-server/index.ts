import { getSession, type ExpressAuthConfig } from '@auth/express';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import { prisma } from 'sil.appbuilder.portal.common';
import { fileURLToPath } from 'url';
import { ScriptoriaWorker } from './BullWorker.js';

// Do not import any functional code from the sveltekit codebase
// unless you are positive you know what you are doing

const app = express();

// Workaround for prisma expecting CommonJS (__dirname and __filename polyfill)
// Polyfill https://github.com/prisma/prisma/issues/15614#issuecomment-2126271831
globalThis.__filename = fileURLToPath(import.meta.url);
globalThis.__dirname = path.dirname(__filename);

const authConfig: ExpressAuthConfig = {
  secret: process.env.VITE_AUTH0_SECRET,
  providers: [
    Auth0Provider({
      id: 'auth0',
      name: 'Auth0',
      clientId: process.env.VITE_AUTH0_CLIENT_ID,
      clientSecret: process.env.VITE_AUTH0_CLIENT_SECRET,
      issuer: `https://${process.env.VITE_AUTH0_DOMAIN}/`,
      wellKnown: `https://${process.env.VITE_AUTH0_DOMAIN}/.well-known/openid-configuration`
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // @ts-expect-error userId is not defined in source
      session.user.userId = token.userId;
      return session;
    }
  }
};

function verifyAuthenticated(requireAdmin: boolean) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = res.locals.session ?? (await getSession(req, authConfig));
    if (!session?.user) {
      res.redirect('/login');
    } else if (requireAdmin) {
      const superAdminRoles = await prisma.userRoles.findMany({
        where: {
          UserId: session.user.userId,
          // RoleId.SuperAdmin
          RoleId: 1
        }
      });
      if (superAdminRoles.length === 0) {
        // Could redirect to /tasks
        res.status(403);
        res.end('You do not have permission to access this resource');
      } else {
        next();
      }
    } else {
      next();
    }
  };
}

// No auth
app.get('/healthcheck', (req, res) => {
  res.end('ok');
});

// BullMQ variables
import { queues } from 'sil.appbuilder.portal.common';
// Running on svelte process right now. Consider putting on new thread
// Fine like this if majority of job time is waiting for network requests
// If there is much processing it should be moved to another thread
new ScriptoriaWorker(queues.QueueName.Scriptoria);
new ScriptoriaWorker(queues.QueueName.DefaultRecurring);

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/jobs');
createBullBoard({
  queues: [new BullAdapter(queues.scriptoria), new BullAdapter(queues.default_recurring)],
  serverAdapter
});

// Require admin auth
app.use('/admin/jobs', verifyAuthenticated(true), serverAdapter.getRouter());

// build folder does not exist normally, but does during build
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const handler = await import('./build/handler.js');
// Svelte application handles authentication already, including login and logout
app.use(handler.handler);

app.listen(3000, () => console.log('Server started!'));

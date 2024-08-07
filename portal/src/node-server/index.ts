import { getSession, type ExpressAuthConfig } from '@auth/express';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter.js';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

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
      // I really don't like this. I ought to be able to check the jwt without passing this information
      // to the client, but @auth/express doesn't seem to support it. Doesn't matter, it's like 20 bytes
      // and it's not sensitive information to pass to the client. It will always say yes or not pass
      // Also, it is possible for a user who was once super admin to save the jwt and
      // access this bull-board panel after their super admin role has been revoked
      // @ts-expect-error isSuperAdmin is not defined in source
      session.user.isSuperAdmin = token.isSuperAdmin;
      return session;
    }
  }
};

function verifyAuthenticated(requireAdmin: boolean) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const session = res.locals.session ?? (await getSession(req, authConfig));
    if (!session?.user) {
      res.redirect('/login');
    } else if (requireAdmin && !session?.user?.isSuperAdmin) {
      res.status(403);
      res.end('You do not have permission to access this resource');
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
const jobQueue = new Queue('scriptoria', {
  connection: {
    host: 'redis'
  }
});
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/jobs');
createBullBoard({
  queues: [new BullAdapter(jobQueue)],
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

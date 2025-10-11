import { error, redirect } from '@sveltejs/kit';
import { SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types.js';
import { getAuthConnection } from '$lib/server/bullmq/queues';
import { DatabaseReads } from '$lib/server/database/prisma.js';

export const GET: RequestHandler = async ({ locals, url }) => {
  locals.security.requireNothing();
  const challenge = url.searchParams.get('challenge');
  const redirectUrl = url.searchParams.get('redirect-url');
  if (!challenge || !redirectUrl) error(400, 'Missing URL Search Params');
  let urlValid = !!redirectUrl.match(/^org\.sil\.[srdk]ab:/);
  if (!urlValid) {
    try {
      const url = new URL(redirectUrl);
      urlValid = ['localhost', '127.0.0.1'].includes(url.hostname);
    } catch {
      /*empty*/
    }
  }

  if (!urlValid) error(400, 'Invalid redirect url');

  locals.security.requireAuthenticated();

  const code = randomUUID();

  const secret = new TextEncoder().encode(process.env.AUTH0_SECRET);
  const user = await DatabaseReads.users.findUniqueOrThrow({
    where: { Id: locals.security.userId },
    select: {
      Email: true,
      ExternalId: true
    }
  });

  try {
    // we may want to use IORedis key prefixes in the future (https://github.com/redis/ioredis?tab=readme-ov-file#transparent-key-prefixing)
    await getAuthConnection().set(`auth:code:${code}`, challenge, 'EX', 300); // 5 minute (300 s) TTL
    await getAuthConnection().set(
      `auth:token:${code}`,
      await new SignJWT({ email: user.Email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setSubject(user.ExternalId ?? '')
        .setExpirationTime('24h')
        .sign(secret),
      'EX',
      301
    ); // 5 minute (300 s) TTL
  } catch {
    error(500, 'Failed to generate authentication code');
  }

  redirect(302, `${redirectUrl}?code=${code}`);
};

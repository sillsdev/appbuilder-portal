import { error, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types.js';
import { getAuthConnection } from '$lib/server/bullmq/queues';

export const GET: RequestHandler = async ({ locals, url, cookies }) => {
  const challenge = url.searchParams.get('challenge');
  const redirectUrl = url.searchParams.get('redirect-url');
  if (!challenge || !redirectUrl) {
    locals.security.requireNothing();
    error(400, 'Missing URL Search Params');
  }
  locals.security.requireAuthenticated();

  const code = randomUUID();

  const sessionTokenName = 'authjs.session-token';

  const cookie = cookies.get(sessionTokenName);
  if (!cookie) error(401, 'Missing session cookie');

  try {
    // we may want to use IORedis key prefixes in the future (https://github.com/redis/ioredis?tab=readme-ov-file#transparent-key-prefixing)
    await getAuthConnection().set(`auth:code:${code}`, challenge, 'EX', 300); // 5 minute (300 s) TTL
    await getAuthConnection().set(
      `auth:cookie:${code}`,
      cookies.serialize(sessionTokenName, cookie, {
        path: '/',
        maxAge: 24 * 60 * 60 // max age 24 hours
      }),
      'EX',
      301
    ); // 5 minute (300 s) TTL
  } catch {
    error(500, 'Failed to generate authentication code');
  }

  redirect(302, `${redirectUrl}?code=${code}`);
};

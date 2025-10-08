import { error, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { getAuthConnection } from '$lib/server/bullmq/queues';

export async function GET({ locals, url, cookies }) {
  const challenge = url.searchParams.get('challenge');
  const redirectUrl = url.searchParams.get('redirect-url');
  if (!challenge || !redirectUrl) {
    locals.security.requireNothing();
    error(400, 'Missing URL Search Params');
  }
  locals.security.requireAuthenticated();

  const code = randomUUID();

  // we may want to use IORedis key prefixes in the future (https://github.com/redis/ioredis?tab=readme-ov-file#transparent-key-prefixing)
  await getAuthConnection().set(`auth0:code:${code}`, challenge, 'EX', 300); // 5 minute (300 s) TTL
  await getAuthConnection().set(
    `auth0:cookie:${code}`,
    cookies.get('authjs.session-token') ?? '',
    'EX',
    301
  ); // 5 minute (300 s) TTL

  redirect(302, `${redirectUrl}?code=${code}`);
}

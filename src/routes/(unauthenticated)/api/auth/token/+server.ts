import { error, redirect } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import { getAuthConnection } from '$lib/server/bullmq/queues';

export async function GET({ locals, url }) {
  const challenge = url.searchParams.get('challenge');
  const application = url.searchParams.get('application');
  if (!challenge || !application) {
    locals.security.requireNothing();
    error(400, 'Missing URL Search Params');
  }
  locals.security.requireAuthenticated();

  const code = randomUUID();

  // we may want to use IORedis key prefixes in the future (https://github.com/redis/ioredis?tab=readme-ov-file#transparent-key-prefixing)
  await getAuthConnection().set(`auth0:code:${code}`, challenge, 'EX', 3_000); // 5 minute (3,000 s) TTL
  await getAuthConnection().set(`auth0:user:${code}`, locals.security.userId, 'EX', 3_001); // 5 minute (3,000 s) TTL

  redirect(302, `${application}://auth/token?code=${code}`);
}

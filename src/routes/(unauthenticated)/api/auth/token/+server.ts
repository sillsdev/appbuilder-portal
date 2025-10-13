import { error, redirect } from '@sveltejs/kit';
import { SignJWT } from 'jose';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types.js';
import { env } from '$env/dynamic/private';
import { getAuthConnection } from '$lib/server/bullmq/queues';
import { DatabaseReads } from '$lib/server/database/prisma.js';

export const HEAD: RequestHandler = async ({ locals }) => {
  locals.security.requireNothing();
  // Return 200 OK to indicate the endpoint exists
  return new Response(null, { status: 200 });
};

export const GET: RequestHandler = async ({ locals, url }) => {
  locals.security.requireNothing();
  const challenge = url.searchParams.get('challenge');
  const redirectUri = url.searchParams.get('redirect_uri');
  if (!challenge || !redirectUri) error(400, 'Missing URL Search Params');
  if (!/^[A-Za-z0-9_-]{43}$/.test(challenge)) {
    error(400, 'Invalid challenge format: Base64URL (no padding) required');
  }
  let urlValid = !!redirectUri.match(/^org\.sil\.[srdk]ab:/);
  if (!urlValid) {
    try {
      const url = new URL(redirectUri);
      urlValid = ['localhost', '127.0.0.1'].includes(url.hostname);
    } catch {
      /*empty*/
    }
  }

  if (!urlValid) error(400, 'Invalid redirect url');

  locals.security.requireAuthenticated();

  const code = randomUUID();

  if (!env.AUTH0_SECRET) {
    error(500, 'Could not sign token');
  }

  const secret = new TextEncoder().encode(env.AUTH0_SECRET);
  const user = await DatabaseReads.users.findUniqueOrThrow({
    where: { Id: locals.security.userId },
    select: {
      Email: true,
      ExternalId: true
    }
  });
  if (!user.ExternalId) {
    error(500, 'User ExternalId is required for token generation');
  }

  try {
    const token = await new SignJWT({ email: user.Email })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setSubject(user.ExternalId ?? '')
      .setExpirationTime('24h')
      .sign(secret);

    // we may want to use IORedis key prefixes in the future (https://github.com/redis/ioredis?tab=readme-ov-file#transparent-key-prefixing)
    await getAuthConnection()
      .pipeline()
      .set(`auth:code:${code}`, challenge, 'EX', 300)
      .set(`auth:token:${code}`, token, 'EX', 300)
      .exec(); // 5 minute (300 s) TTL
  } catch {
    error(500, 'Failed to generate authentication code');
  }

  const sep = redirectUri.includes('?') ? '&' : '?';
  redirect(302, `${redirectUri}${sep}code=${code}`);
};

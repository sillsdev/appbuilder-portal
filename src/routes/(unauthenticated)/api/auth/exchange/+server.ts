import { error } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import * as v from 'valibot';
import { getAuthConnection } from '$lib/server/bullmq/queues';

export async function POST({ locals, request }) {
  locals.security.requireNothing();

  const body = v.safeParse(
    v.object({
      code: v.pipe(v.string(), v.uuid()),
      verify: v.string()
    }),
    await request.json()
  );

  if (body.success) {
    const challenge = await getAuthConnection().get(`auth0:code:${body.output.code}`);
    const cookie = await getAuthConnection().get(`auth0:cookie:${body.output.code}`);
    if (!challenge) error(400, 'Challenge not found in DB'); // TODO: Is this the right error?

    //immediately invalidate
    await getAuthConnection().del(`auth0:code:${body.output.code}`);
    await getAuthConnection().del(`auth0:cookie:${body.output.code}`);

    const hash = createHash('sha256');
    hash.update(body.output.verify);
    const digest = hash.digest('hex');

    if (digest !== challenge) error(400, 'Failed Verification'); // TODO: Is this the right error?

    return new Response(cookie);
  } else {
    error(400, 'Bad Request');
  }
}

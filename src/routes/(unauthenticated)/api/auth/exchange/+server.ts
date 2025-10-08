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
    request.body
  );

  if (body.success) {
    const challenge = await getAuthConnection().get(`auth:code:${body.output.code}`);
    const cookie = await getAuthConnection().get(`auth:cookie:${body.output.code}`);
    if (!challenge || !cookie) error(400, 'Invalid or expired code'); // TODO: Is this the right error?

    try {
      //immediately invalidate
      await getAuthConnection().del(`auth:code:${body.output.code}`);
      await getAuthConnection().del(`auth:cookie:${body.output.code}`);
    } catch {
      /* empty */
    }

    const hash = createHash('sha256');
    hash.update(body.output.verify);
    const digest = hash.digest('hex');

    if (digest !== challenge) error(400, 'Failed Verification'); // TODO: Is this the right error?

    return new Response(cookie);
  } else {
    error(400, 'Bad Request');
  }
}

import { error } from '@sveltejs/kit';
import { createHash } from 'node:crypto';
import * as v from 'valibot';
import { getAuthConnection } from '$lib/server/bullmq/queues';
import { DatabaseWrites } from '$lib/server/database/index.js';

export async function POST(event) {
  const { locals, request } = event;
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
    const userId = parseInt(
      (await getAuthConnection().get(`auth0:user:${body.output.code}`)) ?? 'NaN' // make sure userId is NaN if not found
    );
    if (!challenge || isNaN(userId)) error(400, 'Bad Request'); // TODO: Is this the right error?

    //immediately invalidate
    await getAuthConnection().del(`auth0:code:${body.output.code}`);
    await getAuthConnection().del(`auth0:user:${body.output.code}`);

    const hash = createHash('sha256');
    hash.update(body.output.verify);
    const digest = hash.digest('hex');

    if (digest !== challenge) error(400, 'Bad Request'); // TODO: Is this the right error?

    const user = await DatabaseWrites.users.findUnique({
      where: { Id: userId },
      select: { Id: true, IsLocked: true }
    });

    if (!user) error(404, 'User not found');
    if (user.IsLocked) error(403, 'User is locked');

    const token = await DatabaseWrites.apiTokens.create({ data: { UserId: userId } });

    return new Response(JSON.stringify({ token: token.Token, expiresAt: token.Expires }));
  } else {
    error(400, 'Bad Request');
  }
}

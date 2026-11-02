import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BuildEngine } from '$lib/server/build-engine-api';
import { DatabaseReads } from '$lib/server/database';

export const POST: RequestHandler = async ({ params, locals }) => {
  locals.security.requireNothing();

  const supportData = await DatabaseReads.supportData.findUnique({
    where: { Id: params.requestGuid }
  });
  if (!supportData) error(404, 'Support request not found');

  const res = await BuildEngine.Requests.request(
    `support/${params.requestGuid}/token`,
    { type: 'provided', ...BuildEngine.Requests.tryGetDefaultBuildEngineParameters() },
    { method: 'POST', body: { name: 'SupportDataCollector', ReadOnly: false } }
  );
  if (!res.ok) error(502, 'Could not get an upload token from BuildEngine');

  return json(await res.json);
};

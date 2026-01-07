import type { RequestHandler } from './$types';
import { DatabaseReads } from '$lib/server/database';

export const GET: RequestHandler = async ({ url, locals }) => {
  // Basic auth check; reuse the same guard pattern as page load/actions
  locals.security.requireAuthenticated();

  const idsParam = url.searchParams.get('ids');
  if (!idsParam) {
    return new Response(JSON.stringify({ error: 'Missing ids' }), { status: 400 });
  }

  const ids = idsParam
    .split(',')
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  if (!ids.length) {
    return new Response(JSON.stringify({ error: 'No valid ids' }), { status: 400 });
  }

  const updates = await DatabaseReads.softwareUpdates.findMany({
    where: { Id: { in: ids } },
    select: {
      Id: true,
      Paused: true,
      DateCompleted: true,
      Version: true,
      DateCreated: true,
      Products: {
        select: {
          Id: true,
          ProductBuilds: {
            where: {
              Success: true
            },
            orderBy: { DateCreated: 'desc' },
            take: 1,
            select: { AppBuilderVersion: true, DateCreated: true }
          }
        }
      }
    }
  });

  const paused = updates.some((u) => !!u.Paused);
  const allCompleted = updates.length > 0 && updates.every((u) => !!u.DateCompleted);

  // Calculate progress: how many products have successful builds with target version
  let completedProducts = 0;

  for (const u of updates) {
    for (const p of u.Products) {
      const build = p.ProductBuilds[0];
      // Check if build matches version and is after update start
      if (
        build &&
        build.AppBuilderVersion === u.Version &&
        build.DateCreated &&
        u.DateCreated &&
        build.DateCreated >= u.DateCreated!
      ) {
        completedProducts++;
      }
    }
  }

  return new Response(
    JSON.stringify({
      ids,
      count: updates.length,
      paused,
      allCompleted,
      completedProducts
    }),
    { headers: { 'content-type': 'application/json' } }
  );
};

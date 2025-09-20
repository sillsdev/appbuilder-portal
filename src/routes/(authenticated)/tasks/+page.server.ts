import type { PageServerLoad } from './$types';
import { getUserTasks } from '$lib/projects/sse';

export const load = (async (event) => {
  event.locals.security.requireAuthenticated();
  const userTasks = await getUserTasks((await event.locals.auth())!.user.userId);
  return { userTasks };
}) satisfies PageServerLoad;

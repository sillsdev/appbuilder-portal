import type { PageServerLoad } from './$types';
import { getUserTasks } from './userTasks';

export const load = (async (event) => {
  const userTasks = await getUserTasks((await event.locals.auth())!.user.userId);
  return { userTasks };
}) satisfies PageServerLoad;

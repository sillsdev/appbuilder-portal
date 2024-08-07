import { scriptoriaQueue } from '$lib/server/bullmq';
import type { Actions } from './$types';

export const actions = {
  async default() {
    await scriptoriaQueue.add('Test Task', { date: new Date() });
    return { ok: true };
  }
} satisfies Actions;

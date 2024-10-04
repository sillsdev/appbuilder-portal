import { error } from '@sveltejs/kit';
import { BullMQ, scriptoriaQueue } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions } from './$types';

const secondsSchema = v.object({
  seconds: v.number()
});

export const actions = {
  async default(event) {
    if (!(await event.locals.auth())?.user.roles.find((r) => r[1] === RoleId.SuperAdmin)) {
      return error(403);
    }
    const form = await superValidate(event.request, valibot(secondsSchema));
    if (!form.valid) return fail(400, { ok: false });
    await scriptoriaQueue.add('Admin Test Task (No-op)', {
      type: BullMQ.ScriptoriaJobType.Test,
      time: form.data.seconds
    });
    return { ok: true };
  }
} satisfies Actions;

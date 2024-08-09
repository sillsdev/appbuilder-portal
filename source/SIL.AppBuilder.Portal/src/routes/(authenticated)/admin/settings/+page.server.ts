import { scriptoriaQueue } from 'sil.appbuilder.portal.common';
import { ScriptoriaJobType } from 'sil.appbuilder.portal.common/BullJobTypes';
import type { Actions } from './$types';

export const actions = {
  async default() {
    await scriptoriaQueue.add('Admin Test Task (No-op)', {
      type: ScriptoriaJobType.Test,
      // 10-20 seconds
      time: Math.random() * 10 + 10
    });
    return { ok: true };
  }
} satisfies Actions;

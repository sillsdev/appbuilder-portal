import { redirect } from '@sveltejs/kit';
import { signIn } from '../../../../auth';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { QueueConnected } from '$lib/server/bullmq';

export const load: PageServerLoad = async (event) => {
  if ((await event.locals.auth())?.user && QueueConnected()) {
    if (event.cookies.get('inviteToken')) {
      const inviteToken = event.cookies.get('inviteToken')!;
      return redirect(302, localizeHref('/invitations/organization-membership?t=' + inviteToken));
    }
    return redirect(302, localizeHref('/tasks'));
  }
};
export const actions: Actions = { default: signIn };

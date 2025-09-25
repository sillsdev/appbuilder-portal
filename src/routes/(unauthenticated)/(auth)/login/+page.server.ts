import { redirect } from '@sveltejs/kit';
import { signIn } from '../../../../auth';
import type { Actions, PageServerLoad } from './$types';
import { localizeHref } from '$lib/paraglide/runtime';
import { QueueConnected } from '$lib/server/bullmq';

export const load: PageServerLoad = async (event) => {
  event.locals.security.requireNothing();
  if (event.locals.security.userId && QueueConnected()) {
    if (event.cookies.get('inviteToken')) {
      const inviteToken = event.cookies.get('inviteToken')!;
      return redirect(302, localizeHref('/invitations/organization-membership?t=' + inviteToken));
    }
    const redirectUrl = event.url.searchParams.get('returnTo');
    return redirect(302, localizeHref(redirectUrl || '/tasks'));
  }
  return {
    serviceAvailable: QueueConnected()
  };
};
export const actions: Actions = {
  async default(event) {
    event.locals.security.requireNothing();
    return await signIn(event);
  }
};

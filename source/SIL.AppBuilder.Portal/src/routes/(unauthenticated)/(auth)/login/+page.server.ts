import { redirect } from '@sveltejs/kit';
import { signIn } from '../../../../auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
  if ((await event.locals.auth())?.user) {
    if (event.cookies.get('inviteToken')) {
      const inviteToken = event.cookies.get('inviteToken')!;
      return redirect(302, '/invitations/organization-membership?t=' + inviteToken);
    }
    return redirect(302, '/tasks');
  }
};
export const actions: Actions = { default: signIn };

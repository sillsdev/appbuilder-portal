import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { acceptOrganizationInvite, checkInviteErrors } from '$lib/organizationInvites';
import { localizeHref } from '$lib/paraglide/runtime';

export const load = (async (event) => {
  event.locals.security.requireNothing();
  const inviteToken = event.url.searchParams.get('t')!;
  // Clear the inviteToken cookie if it exists
  if (event.cookies.get('inviteToken')) {
    event.cookies.set('inviteToken', '', { path: '/' });
  }
  const errors = await checkInviteErrors(inviteToken);
  if (errors.error) return errors;
  const session = await event.locals.auth();
  if (session) {
    return await acceptOrganizationInvite(session.user.userId, inviteToken);
  } else {
    // Add a session scope cookie to redirect to the invite page after login
    event.cookies.set('inviteToken', inviteToken, {
      path: '/'
    });
    // When there is an inviteToken, returnTo is unnecessary
    return redirect(302, localizeHref('/login'));
  }
}) satisfies PageServerLoad;

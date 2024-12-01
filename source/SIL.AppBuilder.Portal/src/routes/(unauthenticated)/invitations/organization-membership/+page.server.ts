import { acceptOrganizationInvite, checkInviteErrors } from '$lib/organizationInvites';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
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
    return redirect(302, '/login');
  }
}) satisfies PageServerLoad;

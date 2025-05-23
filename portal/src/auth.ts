import { checkInviteErrors } from '$lib/organizationInvites';
import { localizeHref } from '$lib/paraglide/runtime';
import { verifyCanViewAndEdit } from '$lib/projects/server';
import { ServerStatus } from '$lib/utils';
import { isAdmin, isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';
import type { Session } from '@auth/sveltekit';
import { SvelteKitAuth, type DefaultSession, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { error, redirect, type Handle } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import type { RoleId } from 'sil.appbuilder.portal.common/prisma';

declare module '@auth/sveltekit' {
  interface Session {
    user: {
      userId: number;
      /** [organizationId, RoleId][]*/
      roles: [number, RoleId][];
    } & DefaultSession['user'];
  }
}

// Stupidly hacky way to get access to the request data from the auth callbacks
// This is a global variable that is set in a separate hook handle
let currentInviteToken: string | null = null;
let tokenStatus: TokenStatus | null = null;
enum TokenStatus {
  Absent,
  Valid,
  Invalid
}

const config: SvelteKitAuthConfig = {
  trustHost: true,
  providers: [
    Auth0Provider({
      id: 'auth0',
      name: 'Auth0',
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      clientSecret: import.meta.env.VITE_AUTH0_CLIENT_SECRET,
      issuer: `https://${import.meta.env.VITE_AUTH0_DOMAIN}/`,
      wellKnown: `https://${import.meta.env.VITE_AUTH0_DOMAIN}/.well-known/openid-configuration`
    })
  ],
  secret: import.meta.env.VITE_AUTH0_SECRET,
  // debug: true,
  session: {
    maxAge: 60 * 60 * 24 // 24 hours
  },
  callbacks: {
    async signIn({ profile }) {
      // The user must exist. Users can only be created initially through an organization invite.
      // This means all users must have an organization.

      // 1. The user exists
      //   - There is an invite -> login, then redirect to /invitations/organization-membership
      //   - There is no invite -> login normally
      // 2. The user does not exist and there is an invite
      //   - invite is invalid -> redirect to /invitations/organization-membership
      //   - invite is valid -> login, then redirect to /invitations/organization-membership
      // 3. The user does not exist and there is no invite -> redirect to /login/no-organization

      if (!profile || !profile.sub) return false;
      const user = await DatabaseWrites.utility.getUserIfExists(profile.sub);
      if (user) {
        return true;
      } else {
        if (tokenStatus === TokenStatus.Absent) return '/login/no-organization';
        if (tokenStatus === TokenStatus.Invalid)
          return '/invitations/organization-membership?t=' + currentInviteToken;
        // If there is a pending invitation, allow the login anyway and create the user account
        if (tokenStatus === TokenStatus.Valid) {
          await DatabaseWrites.utility.createUser(profile);
          return true;
        }
      }
      throw new Error('Invalid state');
    },
    async jwt({ profile, token }) {
      // Called in two cases:
      // a: client just logged in (new session): profile is passed and token is not (trigger == 'signIn')
      // b: subsequent calls (during an existing session), token is passed and profile is not (trigger == 'update')

      // make sure to handle values that could change mid-session in both cases
      // safest method is just handle such values in session below (see user.roles)
      if (!profile) return token;
      if (!profile.sub) throw new Error('No sub in profile');
      const dbUser = await DatabaseWrites.utility.getUserIfExists(profile.sub);
      if (!dbUser) throw new Error('User not found');
      token.userId = dbUser.Id;
      return token;
    },
    async session({ session, token }) {
      session.user.userId = token.userId as number;
      const userRoles = await prisma.userRoles.findMany({
        where: {
          UserId: token.userId as number
        }
      });
      session.user.roles = userRoles.map((role) => [role.OrganizationId, role.RoleId]);
      return session;
    }
  }
};
// Handles the /auth route, which is used to handle external auth0 authentication
export const { handle: authRouteHandle, signIn, signOut } = SvelteKitAuth(config);

export const checkUserExistsHandle: Handle = async ({ event, resolve }) => {
  // If the user does not exist in the database, invalidate the login and redirect to prevent unauthorized access
  // This can happen when the user is deleted from the database but still has a valid session.
  // This should only happen when a superadmin manually deletes a user but is particularly annoying in development
  // The user should also be redirected if they are not a member of any organizations
  // Finally, the user should be redirected if they are locked
  const userId = (await event.locals.auth())?.user.userId;
  if (!userId) {
    // User has no session at all; allow normal events
    return resolve(event);
  }
  const user = await prisma.users.findUnique({
    where: {
      Id: userId
    },
    include: {
      OrganizationMemberships: true
    }
  });
  if (!user || (user.OrganizationMemberships.length === 0 && !event.cookies.get('inviteToken'))) {
    event.cookies.set('authjs.session-token', '', { path: '/' });
    return redirect(302, localizeHref('/login/no-organization'));
  }
  if (user.IsLocked) {
    event.cookies.set('authjs.session-token', '', { path: '/' });
    return redirect(302, localizeHref('/login/locked'));
  }
  return resolve(event);
};

// Handle organization invites
export const organizationInviteHandle: Handle = async ({ event, resolve }) => {
  // Hacky solution to get the request object in the auth callbacks
  // while making sure it only exists
  currentInviteToken = event.cookies.get('inviteToken') ?? '';

  // verify the token
  if (currentInviteToken) {
    const errors = await checkInviteErrors(currentInviteToken);
    if (errors.error) tokenStatus = TokenStatus.Invalid;
    else tokenStatus = TokenStatus.Valid;
  } else {
    tokenStatus = TokenStatus.Absent;
  }

  const result = await resolve(event);

  currentInviteToken = null;
  tokenStatus = null;
  return result;
};

// Locks down the authenticated routes by redirecting to /login
// This guarantees a logged in user under (authenticated) but does not guarantee
// authorization to the route. Each page must manually check in +page.server.ts or here
export const localRouteHandle: Handle = async ({ event, resolve }) => {
  if (
    !event.route.id?.startsWith('/(unauthenticated)') &&
    event.route.id !== '/' &&
    event.route.id !== null
  ) {
    const session = await event.locals.auth();
    if (!session) return redirect(302, localizeHref('/login'));
    const status = await validateRouteForAuthenticatedUser(session, event.route.id, event.params);
    if (status !== ServerStatus.Ok) return error(status);
  }
  return resolve(event);
};

async function validateRouteForAuthenticatedUser(
  session: Session,
  route: string,
  params: Partial<Record<string, string>>
): Promise<ServerStatus> {
  const path = route.split('/').filter((r) => !!r);
  // Only guarding authenticated routes
  if (path[0] === '(authenticated)') {
    if (path[1] === 'admin' || path[1] === 'workflow-instances')
      return isSuperAdmin(session?.user?.roles) ? ServerStatus.Ok : ServerStatus.Forbidden;
    else if (path[1] === 'directory' || path[1] === 'open-source')
      // Always allowed. Open pages
      return ServerStatus.Ok;
    else if (path[1] === 'organizations') {
      // Must be org admin for some organization (or a super admin)
      if (!isAdmin(session?.user?.roles)) return ServerStatus.Forbidden;
      if (params.id) {
        // Must be org admin for specified organization (or a super admin)
        return isAdminForOrg(parseInt(params.id!), session?.user?.roles)
          ? ServerStatus.Ok
          : ServerStatus.Forbidden;
      }
      return ServerStatus.Ok;
    } else if (path[1] === 'products') {
      const product = await prisma.products.findFirst({
        where: {
          Id: params.id
        }
      });
      if (!product) return ServerStatus.NotFound;
      // Must be allowed to view associated project
      // (this route was originally part of the project page but was moved elsewhere to improve load time)
      return await verifyCanViewAndEdit(session, product.ProjectId);
    } else if (path[1] === 'projects') {
      if (path[2] === '[filter=projectSelector]') return ServerStatus.Ok;
      else if (path[2] === '[id=idNumber]') {
        // A project can be viewed if the user owns it, is an org admin for the org, or is a super admin
        return await verifyCanViewAndEdit(session, parseInt(params.id!));
      }
      return ServerStatus.Ok;
    } else if (path[1] === 'tasks') {
      // Own task list always allowed, and specific products checked manually
      return ServerStatus.Ok;
    } else if (path[1] === 'users') {
      // Checked manually in the users route
      return ServerStatus.Ok;
    } else {
      // Unknown route. We'll assume it's a legal route
      return ServerStatus.Ok;
    }
  } else {
    return ServerStatus.Ok;
  }
}

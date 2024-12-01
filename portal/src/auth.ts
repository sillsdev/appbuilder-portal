import { checkInviteErrors } from '$lib/organizationInvites';
import type { Session } from '@auth/express';
import { SvelteKitAuth, type DefaultSession, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { error, redirect, type Handle } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { verifyCanViewAndEdit } from './lib/projects/common.server';

declare module '@auth/sveltekit' {
  interface Session {
    user: {
      userId: number;
      /** [organizationId, RoleId][]*/
      roles: [number, number][];
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

      // 1. The user is logging in normally without an invite
      //   - the user exists -> login normally
      //   - the user does not exist -> redirect to /login/no-organization
      // 2. The user is logging in with a provided invite
      //   - the user exists -> login normally, then redirect to /invitations/organization-membership
      //   - the user does not exist
      //     - the invite is invalid -> redirect to /invitations/organization-membership where the relevant error will be displayed
      //     - the invite is valid -> login normally, then redirect to /invitations/organization-membership

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
    if (!session) return redirect(302, '/login');
    if (!(await validateRouteForAuthenticatedUser(session, event.route.id, event.params)))
      return error(403);
  }
  return resolve(event);
};

async function validateRouteForAuthenticatedUser(
  session: Session,
  route: string,
  params: Partial<Record<string, string>>
): Promise<boolean> {
  const path = route.split('/').filter((r) => !!r);
  // Only guarding authenticated routes
  if (path[0] === '(authenticated)') {
    if (path[1] === 'admin') return !!session.user.roles.find((r) => r[1] === RoleId.SuperAdmin);
    else if (path[1] === 'directory' || path[1] === 'open-source')
      // Always allowed. Open pages
      return true;
    else if (path[1] === 'organizations') {
      // Must be org admin or super admin for some organization
      if (!session.user.roles.find((r) => r[1] === RoleId.SuperAdmin || r[1] === RoleId.OrgAdmin))
        return false;
      // Must be org admin or super admin for this organization
      if (params.id)
        return !!session.user.roles.find(
          (r) =>
            r[1] === RoleId.SuperAdmin ||
            (r[0] === parseInt(params.id!) && r[1] === RoleId.OrgAdmin)
        );
      return true;
    } else if (path[1] === 'products') {
      // TODO not sure, probably based on ownership of the project
      const projectId = (
        await prisma.products.findFirst({
          where: {
            Id: params.id
          }
        })
      )?.ProjectId;
      if (!projectId) return false;
      return verifyCanViewAndEdit(session, projectId);
    } else if (path[1] === 'projects') {
      if (path[2] === '[filter=projectSelector]') return true;
      // TODO: what are the conditions for viewing a project
      // I imagine either own it or be organization admin
      else if (path[2] === '[id=idNumber]') {
        return await verifyCanViewAndEdit(session, parseInt(params.id!));
      }
      return true;
    } else if (path[1] === 'tasks') {
      // Own task list always allowed, and specific products checked manually
      return true;
    } else if (path[1] === 'users') {
      // Checked manually in the users route
      return true;
    } else {
      // Unknown route. We'll assume it's a legal route
      return true;
    }
  } else {
    return true;
  }
}

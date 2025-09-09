import {
  type DefaultSession,
  type Session,
  SvelteKitAuth,
  type SvelteKitAuthConfig
} from '@auth/sveltekit';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { trace } from '@opentelemetry/api';
import { type Handle, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { checkInviteErrors } from '$lib/organizationInvites';
import { localizeHref } from '$lib/paraglide/runtime';
import type { RoleId } from '$lib/prisma';
import { verifyCanEdit, verifyCanView } from '$lib/projects/server';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { adminOrgs } from '$lib/users/server';
import { ServerStatus } from '$lib/utils';
import { isAdmin, isAdminForOrg, isSuperAdmin } from '$lib/utils/roles';

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
      clientId: env.AUTH0_CLIENT_ID,
      clientSecret: env.AUTH0_CLIENT_SECRET,
      issuer: `https://${env.AUTH0_DOMAIN}/`,
      wellKnown: `https://${env.AUTH0_DOMAIN}/.well-known/openid-configuration`
    })
  ],
  secret: env.AUTH0_SECRET,
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
      let userExists: boolean = false;
      let user;
      try {
        if (!profile || !profile.sub) return false;
        try {
          user = await DatabaseWrites.utility.getUserIfExists(profile.sub);
        } catch {
          // If the database is down, return the user to the homepage
          return '/';
        }
        userExists = !!user;
        if (userExists) {
          return true;
        } else {
          if (tokenStatus === TokenStatus.Absent) return '/login/no-organization';
          if (tokenStatus === TokenStatus.Invalid)
            return '/invitations/organization-membership?t=' + currentInviteToken;
          // If there is a pending invitation, allow the login anyway and create the user account
          if (tokenStatus === TokenStatus.Valid) {
            user = await DatabaseWrites.utility.createUser(profile);
            return true;
          }
        }
        throw new Error('Invalid state');
      } finally {
        trace.getActiveSpan()?.addEvent('signIn callback completed', {
          'auth.signIn.profile': profile ? profile.email + ' - ' + profile.sub : 'unknown',
          'auth.signIn.tokenStatus': tokenStatus ?? 'null',
          'auth.signIn.currentInviteToken': currentInviteToken ?? 'null',
          'auth.signIn.user': JSON.stringify(user),
          'auth.signIn.userExists': userExists
        });
      }
    },
    async jwt({ profile, token }) {
      // Called in two cases:
      // a: client just logged in (new session): profile is passed and token is a small subset (trigger == 'signIn')
      // b: subsequent calls (during an existing session), token is passed and profile is not (trigger == 'update')

      // make sure to handle values that could change mid-session in both cases
      // safest method is just handle such values in session below (see user.roles)
      try {
        if (!profile) return token;
        if (!profile.sub) throw new Error('No sub in profile');
        const dbUser = await DatabaseWrites.utility.getUserIfExists(profile.sub);
        if (!dbUser) throw new Error('User not found');
        token.userId = dbUser.Id;
        return token;
      } finally {
        trace.getActiveSpan()?.addEvent('jwt callback completed', {
          'auth.jwt.profile': profile ? profile.email + ' - ' + profile.sub : 'unknown',
          'auth.jwt.token.userId': (token?.userId as number) ?? 'null'
        });
      }
    },
    async session({ session, token }) {
      // Provide the userId and roles in the session
      // Accessible by server and client
      session.user.userId = token.userId as number;
      const userRoles = await DatabaseReads.userRoles.findMany({
        where: {
          UserId: token.userId as number
        }
      });
      session.user.roles = userRoles.map((role) => [role.OrganizationId, role.RoleId]);
      trace.getActiveSpan()?.addEvent('session callback completed', {
        'auth.session.userId': session.user.userId,
        'auth.session.roles': JSON.stringify(session.user.roles)
      });
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
  const user = await DatabaseReads.users.findUnique({
    where: {
      Id: userId
    },
    include: {
      OrganizationMemberships: true
    }
  });
  trace.getActiveSpan()?.addEvent('checkUserExistsHandle completed', {
    'auth.checkUserExists.userId': userId,
    'auth.checkUserExists.user': user ? user.Email + ' - ' + user.Id : 'null',
    'auth.checkUserExists.user.OrganizationMemberships': user
      ? JSON.stringify(user.OrganizationMemberships.map((m) => m.OrganizationId))
      : 'null',
    'auth.checkUserExists.user.IsLocked': user ? user.IsLocked.toString() : 'null'
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
  trace.getActiveSpan()?.addEvent('organizationInviteHandle completed', {
    'auth.organizationInvite.currentInviteToken': currentInviteToken ?? 'null',
    'auth.organizationInvite.tokenStatus': tokenStatus ?? 'null'
  });

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
    const status = await validateRouteForAuthenticatedUser(
      session,
      event.route.id,
      event.params,
      event.request.method
    );
    trace.getActiveSpan()?.addEvent('localRouteHandle completed', {
      'auth.localRouteHandle.routeId': event.route.id ?? 'null',
      'auth.localRouteHandle.params': JSON.stringify(event.params),
      'auth.localRouteHandle.session.userId': session.user.userId,
      'auth.localRouteHandle.session.roles': JSON.stringify(session.user.roles),
      'auth.localRouteHandle.status': status
    });
    if (status !== ServerStatus.Ok) {
      // error.html is extremely ugly, so we use a manual error throw
      event.locals.error = status;
    }
  }
  return resolve(event);
};

async function validateRouteForAuthenticatedUser(
  session: Session,
  route: string,
  params: Partial<Record<string, string>>,
  method: string
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
        const Id = parseInt(params.id);
        if (isNaN(Id) || !(await DatabaseReads.organizations.findFirst({ where: { Id } }))) {
          return ServerStatus.NotFound;
        }
        return isAdminForOrg(Id, session?.user?.roles) ? ServerStatus.Ok : ServerStatus.Forbidden;
      }
      return ServerStatus.Ok;
    } else if (path[1] === 'products') {
      try {
        const product = await DatabaseReads.products.findFirst({
          where: {
            Id: params.id
          }
        });
        if (!product) return ServerStatus.NotFound;
        // Must be allowed to view associated project
        // (this route was originally part of the project page but was moved elsewhere to improve load time)
        return await verifyCanView(session, product.ProjectId);
      } catch {
        return ServerStatus.NotFound;
      }
    } else if (path[1] === 'projects') {
      if (path[2] === '[filter=projectSelector]') return ServerStatus.Ok;
      else if (path[2] === '[id=idNumber]') {
        // prevent edits and actions without breaking SSE
        if (path[3] === 'edit' || (method === 'POST' && path[3] !== 'sse')) {
          return await verifyCanEdit(session, parseInt(params.id!));
        }
        // A project can be viewed if the user is an admin or in the project's group
        return await verifyCanView(session, parseInt(params.id!));
      }
      return ServerStatus.Ok;
    } else if (path[1] === 'tasks') {
      // Own task list always allowed, and specific products checked manually
      return ServerStatus.Ok;
    } else if (path[1] === 'users') {
      // /(invite): admin
      if (path.length === 2 || path[2] === 'invite') {
        return isAdmin(session?.user?.roles) ? ServerStatus.Ok : ServerStatus.Forbidden;
      } else if (path[2] === '[id=idNumber]') {
        // /id: not implemented yet (ISSUE #1142)
        const subjectId = parseInt(params.id!);
        if (!(await DatabaseReads.users.findFirst({ where: { Id: subjectId } })))
          return ServerStatus.NotFound;
        const admin = !!(await DatabaseReads.organizations.findFirst({
          where: adminOrgs(subjectId, session.user.userId, isSuperAdmin(session.user.roles)),
          select: {
            Id: true
          }
        }));
        // /id/settings/(profile): self and admin
        if (!path.at(4) || path[4] === 'profile') {
          return subjectId === session.user.userId || admin
            ? ServerStatus.Ok
            : ServerStatus.Forbidden;
        } else {
          // /id/settings/*: admin
          return admin ? ServerStatus.Ok : ServerStatus.Forbidden;
        }
      }
      return ServerStatus.Ok;
    } else {
      // Unknown route. We'll assume it's a legal route
      return ServerStatus.Ok;
    }
  } else {
    return ServerStatus.Ok;
  }
}

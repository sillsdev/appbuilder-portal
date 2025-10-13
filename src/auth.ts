import {
  type DefaultSession,
  type Session,
  SvelteKitAuth,
  type SvelteKitAuthConfig
} from '@auth/sveltekit';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { trace } from '@opentelemetry/api';
import { type Handle, error, redirect } from '@sveltejs/kit';
import { jwtVerify } from 'jose';
import { env } from '$env/dynamic/private';
import { checkInviteErrors } from '$lib/organizationInvites';
import { localizeHref } from '$lib/paraglide/runtime';
import { RoleId } from '$lib/prisma';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';

declare module '@auth/sveltekit' {
  interface Session {
    user: DefaultSession['user'] & {
      userId: number;
      roles: [number, RoleId][];
    };
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
        tokenStatus = null;
        currentInviteToken = null;
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
      session.user.roles = userRoles.map(({ OrganizationId, RoleId }) => [OrganizationId, RoleId]);
      trace.getActiveSpan()?.addEvent('session callback completed', {
        'auth.session.userId': session.user.userId,
        'auth.session.roles': JSON.stringify(session.user.roles)
      });
      return session;
    }
  }
};

export class Security {
  public readonly isSuperAdmin;
  public securityHandled = false;
  public readonly sessionForm: Session['user'];
  private isApiRoute;
  constructor(
    public readonly event: Parameters<Handle>[0]['event'],
    // Note these three CAN be null if the user is not authenticated
    public readonly userId: number,
    public readonly organizationMemberships: number[],
    public readonly roles: Map<number, RoleId[]>,
    public readonly usedApiToken: boolean
  ) {
    this.isSuperAdmin = roles?.values().some((r) => r.includes(RoleId.SuperAdmin)) ?? false;
    this.sessionForm = {
      userId: this.userId,
      roles: [
        ...(roles
          ?.entries()
          .map(([orgId, roleIds]) => roleIds.map((r) => [orgId, r]) as [number, RoleId][]) ?? [])
      ].flat(1)
    };
    this.isApiRoute = false;
  }

  requireApiToken() {
    this.isApiRoute = true;
    this.requireAuthenticated();
  }

  requireAuthenticated() {
    this.securityHandled = true;
    if (!this.isApiRoute && this.usedApiToken) {
      error(403, 'API Token cannot be used on this route!');
    }
    if (!this.userId || !this.organizationMemberships || !this.roles) {
      // Redirect to login
      const originalUrl = this.event.url;
      const returnTo = originalUrl.pathname + originalUrl.search;
      throw redirect(302, localizeHref('/login?returnTo=' + encodeURIComponent(returnTo)));
    }
  }

  requireSuperAdmin() {
    this.requireAuthenticated();
    if (!this.isSuperAdmin) error(403, 'User is not a super admin');
    return this;
  }

  requireAdminOfOrgIn(organizationIds: number[]) {
    this.requireAuthenticated();
    if (
      !this.isSuperAdmin &&
      !organizationIds.some((id) => this.roles.get(id)?.includes(RoleId.OrgAdmin))
    ) {
      error(403, 'User is not an admin for the organization');
    }
    return this;
  }

  requireAdminOfOrg(organizationId: number) {
    this.requireAuthenticated();
    this.requireAdminOfOrgIn([organizationId]);
    return this;
  }

  requireAdminOfAny() {
    this.requireAuthenticated();
    if (!this.isSuperAdmin && !this.roles.values().some((r) => r.includes(RoleId.OrgAdmin)))
      error(403, 'User is not an admin of any organization');
    return this;
  }

  requireHasRole(organizationId: number, roleId: RoleId, orOrgAdmin = true) {
    this.requireAuthenticated();
    if (
      !this.isSuperAdmin &&
      !this.roles.get(organizationId)?.includes(roleId) &&
      !(orOrgAdmin && this.roles.get(organizationId)?.includes(RoleId.OrgAdmin))
    )
      error(403, 'User does not have the required role ' + roleId);
    return this;
  }

  requireMemberOfOrg(organizationId: number) {
    this.requireAuthenticated();
    if (!this.organizationMemberships.includes(organizationId))
      error(403, 'User is not a member of the organization');
    return this;
  }

  requireMemberOfOrgOrSuperAdmin(organizationId: number) {
    this.requireAuthenticated();
    if (!this.isSuperAdmin) this.requireMemberOfOrg(organizationId);
    return this;
  }

  requireProjectWriteAccess(project?: { OwnerId: number; OrganizationId: number } | null) {
    this.requireAuthenticated();
    if (!project) {
      error(404, 'Project not found');
    }
    if (!this.isSuperAdmin && project.OwnerId !== this.userId) {
      this.requireAdminOfOrg(project.OrganizationId);
    }
    return this;
  }

  requireProjectReadAccess(
    userGroups: { GroupId: number }[],
    project?: { OwnerId: number; OrganizationId: number; GroupId: number } | null
  ) {
    this.requireAuthenticated();
    if (!project) {
      error(404, 'Project not found');
    }
    if (!userGroups.find((ug) => ug.GroupId === project.GroupId)) {
      this.requireProjectWriteAccess(project);
    }
    return this;
  }

  requireProjectClaimable(
    userGroups: { GroupId: number }[],
    project?: { OwnerId: number; OrganizationId: number; GroupId: number } | null
  ) {
    this.requireAuthenticated();
    if (!project) {
      error(404, 'Project not found');
    }
    if (this.userId === project.OwnerId) {
      error(400, 'Project owner cannot claim own project');
    }
    if (!this.isSuperAdmin && !userGroups.some((ug) => ug.GroupId === project.GroupId)) {
      error(400, 'User must share a group with the project in order to claim it!');
    }
    return this.requireHasRole(
      project.OrganizationId,
      RoleId.AppBuilder,
      true
    ).requireProjectReadAccess(userGroups, project);
  }

  requireMemberOfAnyOrg() {
    this.requireAuthenticated();
    if (this.organizationMemberships.length === 0)
      error(403, 'User is not a member of any organization');
    return this;
  }

  requireNothing() {
    this.securityHandled = true;
    return this;
  }
}

export const populateSecurityInfo: Handle = async ({ event, resolve }) => {
  const tmpSecurity = (await event.locals.auth())?.user;
  let tmpUserId: number | undefined = undefined;
  if (!tmpSecurity) {
    const authToken = (event.request.headers.get('Authorization') ?? '').replace('Bearer ', '');
    try {
      const secret = new TextEncoder().encode(process.env.AUTH0_SECRET);
      const parsed = await jwtVerify(authToken, secret);
      const extId = parsed.payload.sub;
      const expires = (parsed.payload.exp ?? 0) * 1000; // exp field is in seconds, Date.valueOf() is milliseconds
      // don't use expired tokens, handle no expiry date as expired
      if (extId && new Date().valueOf() < expires) {
        const users = await DatabaseReads.users.findMany({
          where: {
            ExternalId: extId
          },
          select: { Id: true }
        });
        if (users.length === 1) {
          tmpUserId = users[0].Id;
        } else if (users.length > 1) {
          trace.getActiveSpan()?.addEvent('Multiple users with same ExternalId', {
            'auth.externalId': extId,
            'auth.userCount': users.length
          });
        }
      }
    } catch (e) {
      // Suppress auth failures but log for debugging
      trace.getActiveSpan()?.addEvent('API auth failed', {
        'auth.hasToken': !!authToken,
        'auth.validationError': e instanceof Error ? e.message : String(e)
      });
    }
  }

  const security =
    tmpSecurity ??
    (tmpUserId &&
      (await DatabaseReads.users
        .findUniqueOrThrow({ where: { Id: tmpUserId }, include: { UserRoles: true } })
        .then((user) => ({
          userId: user.Id,
          roles: user.UserRoles.map(({ OrganizationId, RoleId }) => [OrganizationId, RoleId])
        }))));

  try {
    if (security) {
      // If the user does not exist in the database, invalidate the login and redirect to prevent unauthorized access
      // This can happen when the user is deleted from the database but still has a valid session.
      // This should only happen when a superadmin manually deletes a user but is particularly annoying in development
      // The user should also be redirected if they are not a member of any organizations
      // Finally, the user should be redirected if they are locked
      const user = await DatabaseReads.users.findUnique({
        where: {
          Id: security.userId
        },
        include: {
          OrganizationMemberships: true
        }
      });

      trace.getActiveSpan()?.addEvent('checkUserExistsHandle completed', {
        'auth.userId': security?.userId,
        'auth.user': user ? user.Email + ' - ' + user.Id : 'null',
        'auth.user.OrganizationMemberships':
          user?.OrganizationMemberships.map((o) => o.OrganizationId).join(', ') ?? 'null',
        'auth.user.roles': user ? JSON.stringify([...security.roles.entries()]) : 'null',
        'auth.user.IsLocked': user ? user.IsLocked + '' : 'null'
      });

      if (
        !user ||
        (user.OrganizationMemberships.length === 0 && !event.cookies.get('inviteToken'))
      ) {
        event.cookies.set('authjs.session-token', '', { path: '/' });
        return redirect(302, localizeHref('/login/no-organization'));
      }
      if (user.IsLocked) {
        event.cookies.set('authjs.session-token', '', { path: '/' });
        return redirect(302, localizeHref('/login/locked'));
      }
      const roleMap = new Map<number, RoleId[]>();
      for (const [orgId, roleId] of security.roles) {
        if (!roleMap.has(orgId)) roleMap.set(orgId, []);
        roleMap.get(orgId)!.push(roleId);
      }
      event.locals.security = new Security(
        event,
        security.userId,
        user.OrganizationMemberships.map((o) => o.OrganizationId),
        roleMap,
        !!tmpUserId
      );
    }
  } finally {
    if (!event.locals.security) {
      // @ts-expect-error Not typed as null but null is allowed
      event.locals.security = new Security(event, null, null, null, false);
    }
  }
  return await resolve(event);
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
  trace.getActiveSpan()?.addEvent('organizationInviteHandle completed', {
    'auth.organizationInvite.currentInviteToken': currentInviteToken ?? 'null',
    'auth.organizationInvite.tokenStatus': tokenStatus ?? 'null'
  });

  const result = await resolve(event);

  currentInviteToken = null;
  tokenStatus = null;
  return result;
};

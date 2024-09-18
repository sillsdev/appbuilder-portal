import type { Session } from '@auth/express';
import { SvelteKitAuth, type DefaultSession, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { error, redirect, type Handle } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import { verifyCanViewAndEdit } from './routes/(authenticated)/projects/[id=idNumber]/common';

declare module '@auth/sveltekit' {
  interface Session {
    user: {
      userId: number;
      roles: [number, number][];
    } & DefaultSession['user'];
  }
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
      if (!profile) return false;
      await DatabaseWrites.utility.getOrCreateUser(profile);
      return true;
    },
    async jwt({ profile, token }) {
      // Called in two cases:
      // a: client just logged in: profile is passed and token is not (trigger == 'signIn')
      // b: subsequent calls, token is passed and profile is not (trigger == 'update')

      // make sure to handle values that could change mid-session in both cases
      // safest method is just handle such values in session below (see user.roles)
      if (!profile) return token;
      const dbUser = await DatabaseWrites.utility.getOrCreateUser(profile);
      token.userId = dbUser.Id;
      return token;
    },
    async session({ session, token }) {
      // const dbUser = await getUserFromId(token.userId);
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

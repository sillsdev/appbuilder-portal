import { SvelteKitAuth, type DefaultSession, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { redirect, type Handle } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { getOrCreateUser } from 'sil.appbuilder.portal.common/prisma';

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
      await getOrCreateUser(profile);
      return true;
    },
    async jwt({ profile, token }) {
      // Called in two cases:
      // a: client just logged in: profile is passed and token is not (trigger == 'signIn')
      // b: subsequent calls, token is passed and profile is not (trigger == 'update')

      // make sure to handle values that could change mid-session in both cases
      // safest method is just handle such values in session below (see user.roles)
      // user.isSuperAdmin is a special case handled here to give the /admin/jobs route
      // access to see if the user has permission to see the BullMQ bull-board queue
      console.log('SVELTE @jwt', token);
      if (!profile) return token;
      const dbUser = await getOrCreateUser(profile);
      token.userId = dbUser.Id;
      token.isSuperAdmin = await isUserSuperAdmin(dbUser.Id);
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
  }
  return resolve(event);
};

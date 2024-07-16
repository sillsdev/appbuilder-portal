// hooks.server.ts
import { getOrCreateUser } from '$lib/prisma';
import { SvelteKitAuth, type DefaultSession, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { redirect, type Handle } from '@sveltejs/kit';

declare module '@auth/sveltekit' {
  interface Session {
    user: {
      userId: number;
    } & DefaultSession['user'];
  }
}

const config: SvelteKitAuthConfig = {
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
      if (!profile) return token;
      const dbUser = await getOrCreateUser(profile);
      token.userId = dbUser.Id;
      return token;
    },
    async session({ session, token }) {
      // const dbUser = await getUserFromId(token.userId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (session.user as any).userId = token.userId;
      return session;
    }
  }
};
// Handles the /auth route, which is used to handle external auth0 authentication
export const { handle: authRouteHandle, signIn, signOut } = SvelteKitAuth(config);

// Locks down the authenticated routes by redirecting to /login
export const localRouteHandle: Handle = async ({ event, resolve }) => {
  if (!event.route.id?.startsWith('/(unauthenticated)') && event.route.id !== '/') {
    const session = await event.locals.auth();
    if (!session) return redirect(303, '/login');
  }
  return resolve(event);
};

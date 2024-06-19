// hooks.server.ts
import { SvelteKitAuth, type SvelteKitAuthConfig } from '@auth/sveltekit';
import Auth0Provider from '@auth/sveltekit/providers/auth0';
import { redirect, type Handle } from '@sveltejs/kit';

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
  debug: true,
  session: {
    maxAge: 60 * 60 * 24 // 24 hours
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

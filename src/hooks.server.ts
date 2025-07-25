// hooks.server.ts
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { Worker } from 'bullmq';
import { BullMQ, DatabaseConnected, QueueConnected, getQueues } from 'sil.appbuilder.portal.common';
import {
  authRouteHandle,
  checkUserExistsHandle,
  localRouteHandle,
  organizationInviteHandle
} from './auth';
import { building } from '$app/environment';
import { localizeHref } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { bullboardHandle } from '$lib/server/bullmq/BullBoard';
import '$lib/server/bullmq/BullMQ';

if (!building) {
  // Otherwise valkey will never connect and the server will always 503
  getQueues();
  // Likewise, initialize the Prisma connection heartbeat
  DatabaseConnected();
}

// creating a handle to use the paraglide middleware
const paraglideHandle: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
    event.request = localizedRequest;
    return resolve(event, {
      transformPageChunk: ({ html }) => {
        return html.replace('%lang%', locale);
      }
    });
  });

const heartbeat: Handle = async ({ event, resolve }) => {
  // this check is important to prevent infinite redirects...
  // Also, the homepage should always be accessible
  if (
    !(
      event.route.id === '/(unauthenticated)/error' ||
      event.route.id === '/(unauthenticated)/(auth)/login' ||
      event.route.id === '/'
    )
  ) {
    if (!(DatabaseConnected() && QueueConnected())) {
      console.log(
        'Services connection error! Connected to Database:',
        DatabaseConnected(),
        'Connected to Valkey:',
        QueueConnected()
      );
      // HTTP 503 *should* be the correct semantics here?
      return redirect(302, localizeHref(`/error?code=503`));
    }
  }
  return resolve(event);
};

export const handle: Handle = sequence(
  paraglideHandle,
  heartbeat,
  organizationInviteHandle,
  authRouteHandle,
  checkUserExistsHandle,
  localRouteHandle,
  bullboardHandle
);

// hooks.server.ts
import { localizeHref } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { Prisma } from '@prisma/client';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { prisma, Queues } from 'sil.appbuilder.portal.common';
import {
  authRouteHandle,
  checkUserExistsHandle,
  localRouteHandle,
  organizationInviteHandle
} from './auth';

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
  if (
    !(
      event.route.id === '/(unauthenticated)/error' ||
      event.route.id === '/(unauthenticated)/(auth)/login'
    )
  ) {
    try {
      const dbtest = await prisma.userTasks.findFirst({ select: { Id: true } });
      if (!Queues.connected()) {
        return redirect(302, localizeHref(`/error?code=503`));
      }
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        // As best as I can tell, the only types of PrismaClientKnownRequestError that
        // should be thrown by the above query would involve the database being unreachable.
        // HTTP 503 *should* be the correct semantics here?
        return redirect(302, localizeHref(`/error?code=503`));
      } else {
        throw e;
      }
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
  localRouteHandle
);

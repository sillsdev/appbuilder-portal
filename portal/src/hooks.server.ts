// hooks.server.ts
import { building } from '$app/environment';
import { localizeHref } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { SSEPageUpdates } from '$lib/projects/listener';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { Worker } from 'bullmq';
import { BullMQ, connected, Queues } from 'sil.appbuilder.portal.common';
import {
  authRouteHandle,
  checkUserExistsHandle,
  localRouteHandle,
  organizationInviteHandle
} from './auth';

if (!building) {
  // Create a worker to listen for project updates
  new Worker<BullMQ.Job>(
    BullMQ.QueueName.SvelteProjectSSE,
    async (job) => {
      switch (job.data.type) {
        case BullMQ.JobType.SvelteSSE_UpdateProject:
          // Trigger an event for the project id
          SSEPageUpdates.emit('projectPage', job.data.projectIds);
          break;
        case BullMQ.JobType.SvelteSSE_UpdateUserTasks:
          // Trigger an event for the user ids
          SSEPageUpdates.emit('userTasksPage', job.data.userIds);
          break;
      }
    },
    Queues.config
  );
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
  if (
    !(
      event.route.id === '/(unauthenticated)/error' ||
      event.route.id === '/(unauthenticated)/(auth)/login'
    )
  ) {
    if (!(connected() && Queues.connected())) {
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
  localRouteHandle
);

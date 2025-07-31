// This import should occur first
// Importing with the --import node flag would be nice but unfortunately
// when code is bundled, we cannot keep the file separate to import it first.

import { trace } from '@opentelemetry/api';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import {
  authRouteHandle,
  checkUserExistsHandle,
  localRouteHandle,
  organizationInviteHandle
} from './auth';
import { building } from '$app/environment';
import OTEL from '$lib/otel';

import { localizeHref } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { RoleId } from '$lib/prisma';
import { QueueConnected, getQueues } from '$lib/server/bullmq';
import { bullboardHandle } from '$lib/server/bullmq/BullBoard';
import '$lib/server/bullmq/BullMQ';
import { DatabaseConnected, DatabaseReads, DatabaseWrites } from '$lib/server/database';

if (!building) {
  // Start OTEL collector
  OTEL.instance.start();
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
    if (!DatabaseConnected()) {
      console.log(
        'Database connection error! Connected to Database:',
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

const tracer = trace.getTracer('IncomingRequest');

const authSequence = sequence(authRouteHandle, checkUserExistsHandle, localRouteHandle);

export const handle: Handle = async ({ event, resolve }) => {
  return tracer.startActiveSpan(`${event.request.method} ${event.url.pathname}`, async (span) => {
    span.setAttributes({
      'http.method': event.request.method,
      'http.url': event.url.href,
      'http.route': event.route.id ?? 'null'
    });
    const response = await sequence(
      paraglideHandle,
      heartbeat,
      organizationInviteHandle,
      // Handle auth hooks in a separate OTEL span
      async function hookTelementry({ event, resolve }) {
        return tracer.startActiveSpan('Auth Hooks', async (span) => {
          // Call the auth sequence
          try {
            const ret = await authSequence({ event, resolve });
            return ret;
          } finally {
            span.end();
          }
        });
      },
      bullboardHandle
    )({ event, resolve });
    span.setAttributes({
      'http.status_code': response.status
    });
    span.end();
    return response;
  });
};

if (!building && typeof process.env.ADD_USER !== 'undefined' && process.env.ADD_USER !== 'false') {
  process.env.ADD_USER = 'false';
  // Bootstrap create an organization invite for the new developer
  const organizationId = await DatabaseReads.organizations.findFirst({});
  const invitedBy = await DatabaseReads.users.findFirst({});
  if (!organizationId || !invitedBy) {
    throw new Error(
      'Missing organizations or users. Please bootstrap the database first using ./run bootstrap.'
    );
  }
  const inviteToken = await DatabaseWrites.organizationMemberships.createOrganizationInvite(
    '',
    organizationId?.Id,
    invitedBy.Id,
    [RoleId.SuperAdmin, RoleId.OrgAdmin],
    []
  );
  const inviteLink = `${process.env.ORIGIN ?? 'http://localhost:6173'}/invitations/organization-membership?t=${inviteToken}`;
  console.log('---- Bootstrap Invite Link ----');
  console.log('Welcome to Scriptoria development!');
  console.log('An invite link has been generated:', inviteLink);
  console.log(
    'Please visit the link to create your account and join the organization. You will then be given SuperAdmin and OrgAdmin access roles.'
  );
  console.log('---- Bootstrap Invite Link ----');
}

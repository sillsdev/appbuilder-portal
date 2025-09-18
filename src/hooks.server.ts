// This import should occur first
// Importing with the --import node flag would be nice but unfortunately
// when code is bundled, we cannot keep the file separate to import it first.

import { SpanStatusCode, trace } from '@opentelemetry/api';
import { type Handle, type HandleServerError, error } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { authRouteHandle, organizationInviteHandle, populateSecurityInfo } from './auth';
import { building } from '$app/environment';
import OTEL from '$lib/otel';

import { paraglideMiddleware } from '$lib/paraglide/server';
import { RoleId } from '$lib/prisma';
import { QueueConnected, getQueues } from '$lib/server/bullmq';
import { bullboardHandle } from '$lib/server/bullmq/BullBoard';
import { allWorkers } from '$lib/server/bullmq/BullMQ';
import { DatabaseConnected, DatabaseReads, DatabaseWrites } from '$lib/server/database';

if (!building) {
  // Start OTEL collector
  OTEL.instance.start();
  // Otherwise valkey will never connect and the server will always 503
  getQueues();
  // Likewise, initialize the Prisma connection heartbeat
  DatabaseConnected();

  // Graceful shutdown
  process.on('sveltekit:shutdown', async () => {
    OTEL.instance.logger.info('Shutting down gracefully...');
    await Promise.all(
      allWorkers.map((worker) => {
        worker.worker?.close();
      })
    );
  });
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

// TODO: investigate not throwing an error here and passing it to load instead
const heartbeat: Handle = async ({ event, resolve }) => {
  // this check is important to prevent infinite redirects...
  // Also, the homepage should always be accessible
  if (!(event.route.id === '/(unauthenticated)/(auth)/login' || event.route.id === '/')) {
    if (!DatabaseConnected()) {
      console.log(
        'Database connection error! Connected to Database:',
        DatabaseConnected(),
        'Connected to Valkey:',
        QueueConnected()
      );
      throw error(503, 'Database connection error');
    }
  }
  return resolve(event);
};

const tracer = trace.getTracer('IncomingRequest');

const authSequence = sequence(authRouteHandle, populateSecurityInfo);

export const handle: Handle = async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/.well-known/appspecific/')) {
    // Ignore these requests without logging them`
    return new Response('', { status: 404 });
  }

  return tracer.startActiveSpan(`${event.request.method} ${event.url.pathname}`, async (span) => {
    let clientIp;
    try {
      clientIp = event.getClientAddress();
    } catch (e) {
      span.recordException(e as Error);
      clientIp = 'unknown';
    }
    span.setAttributes({
      'http.method': event.request.method,
      'http.url': event.url.href,
      'http.route': event.url.pathname ?? '',
      'http.user_agent': event.request.headers.get('user-agent') ?? '',
      'http.client_ip': clientIp,
      'http.x-forwarded-for': event.request.headers.get('x-forwarded-for') ?? '',
      'svelte.route_id': event.route.id ?? ''
    });
    try {
      const response = await sequence(
        paraglideHandle,
        heartbeat,
        organizationInviteHandle,
        // Handle auth hooks in a separate OTEL span
        async function hookTelementry({ event, resolve }) {
          return tracer.startActiveSpan('Auth Hooks', async (span) => {
            // Call the auth sequence
            const ret = await authSequence({
              event,
              resolve: (...args) => {
                span.end();
                return resolve(...args);
              }
            });
            return ret;
          });
        },
        bullboardHandle
      )({ event, resolve });
      // @ts-expect-error securityHandled is not in the type definition
      if (!event.locals.security.securityHandled) {
        OTEL.instance.logger.error(
          `Security checks were not performed for route ${event.url.pathname}`,
          {
            route: event.route.id,
            method: event.request.method,
            url: event.url.href,
            userId: event.locals.security.userId ?? 'unauthenticated',
            http_status_for_response: response.status
          }
        );
        span.recordException(new Error('Security checks were not performed'));
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: 'Security checks were not performed'
        });
        span.setAttributes({
          'http.status_code': 500
        });
        // This is a server error because a developer misconfigured the route
        return new Response('Internal Server Error', { status: 500 });
      }
      span.setAttributes({
        'http.status_code': response.status
      });
      return response;
    } finally {
      span.end();
    }
  });
};

export const handleError: HandleServerError = ({ error, event, status }) => {
  // Log the error with OTEL
  OTEL.instance.logger.error('Error in handleError', {
    error: error instanceof Error ? error.message : String(error),
    route: event.route.id,
    method: event.request.method,
    url: event.url.href
  });
  trace.getActiveSpan()?.recordException(error as Error);
  trace.getActiveSpan()?.setStatus({
    code: SpanStatusCode.ERROR, // Error
    message: error instanceof Error ? error.message : String(error)
  });

  if (status === 404) {
    // Don't log 404 errors, they are common and not actionable
    return {
      message: 'Not found',
      status: 404
    };
  }

  console.error('Error occurred:', error);

  return {
    message: 'An unexpected error occurred. Please try again later.',
    status: 500 // Internal Server Error
  };
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

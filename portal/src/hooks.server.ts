// hooks.server.ts
import { localizeHref } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';
import { type Span } from '@opentelemetry/api';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { connected, OTEL, Queues } from 'sil.appbuilder.portal.common';
import {
  authRouteHandle,
  checkUserExistsHandle,
  localRouteHandle,
  organizationInviteHandle,
  tracer
} from './auth';

// creating a handle to use the paraglide middleware
const paraglideHandle: Handle = ({ event, resolve }) => {
  return tracer.startActiveSpan('paraglide', (span: Span) => {
    const res = paraglideMiddleware(event.request, ({ request: localizedRequest, locale }) => {
      event.request = localizedRequest;
      span.setAttribute('locale', locale);
      return resolve(event, {
        transformPageChunk: ({ html }) => {
          return html.replace('%lang%', locale);
        }
      });
    });
    span.end();
    return res;
  });
};

const heartbeat: Handle = ({ event, resolve }) => {
  return tracer.startActiveSpan('heartbeat', (span: Span) => {
    // this check is important to prevent infinite redirects...
    if (
      !(
        event.route.id === '/(unauthenticated)/error' ||
        event.route.id === '/(unauthenticated)/(auth)/login'
      )
    ) {
      const p = connected();
      const r = Queues.connected();
      if (!(p && r)) {
        if (!p) span.setAttribute('pgsql-connected', p);
        if (!r) span.setAttribute('redis-connected', r);
        span.end();
        // HTTP 503 *should* be the correct semantics here?
        return redirect(302, localizeHref(`/error?code=503`));
      }
    }
    const res = resolve(event);
    span.end();
    return res;
  });
};

const sequenced: Handle = sequence(
  paraglideHandle,
  heartbeat,
  organizationInviteHandle,
  authRouteHandle,
  checkUserExistsHandle,
  localRouteHandle
);

export const handle: Handle = (event) => {
  OTEL.instance.start();
  return tracer.startActiveSpan('handle', (span: Span) => {
    const res = sequenced(event);
    span.end();
    return res;
  });
};

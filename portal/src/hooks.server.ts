// hooks.server.ts
import { i18n } from '$lib/i18n';
import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { authRouteHandle, localRouteHandle, organizationInviteHandle } from './auth';

export const handle: Handle = sequence(
  i18n.handle(),
  organizationInviteHandle,
  authRouteHandle,
  localRouteHandle
);

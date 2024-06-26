// hooks.server.ts
import { i18n } from '$lib/i18n'
import type { Handle } from '@sveltejs/kit';
import { authRouteHandle, localRouteHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';

export const handle: Handle = sequence(
  i18n.handle(),
  authRouteHandle,
  localRouteHandle
);

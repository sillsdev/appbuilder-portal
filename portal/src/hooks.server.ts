// hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { locale } from 'svelte-i18n';
import { authRouteHandle, localRouteHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';

export const handle: Handle = sequence(
  async ({ event, resolve }) => {
    const lang = event.request.headers.get('accept-language')?.split(',')[0];
    if (lang) {
      locale.set(lang);
    }
    return resolve(event);
  },
  authRouteHandle,
  localRouteHandle
);

import type { Reroute, Transport } from '@sveltejs/kit';
import { deLocalizeUrl as GooglePlayDeLocalizeUrl } from '$lib/google-play/paraglide/runtime';
import { deLocalizeUrl as defaultDeLocalizeUrl } from '$lib/paraglide/runtime';

export const reroute: Reroute = (request) => {
  const isGooglePlay = !!request.url.pathname.match(/\/(downloads|user-data)/);
  return (isGooglePlay ? GooglePlayDeLocalizeUrl : defaultDeLocalizeUrl)(request.url).pathname;
};

export const transport: Transport = {};

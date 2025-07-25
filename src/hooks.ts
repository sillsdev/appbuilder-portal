import type { Reroute, Transport } from '@sveltejs/kit';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

export const reroute: Reroute = (request) => {
  return deLocalizeUrl(request.url).pathname;
};

export const transport: Transport = {};

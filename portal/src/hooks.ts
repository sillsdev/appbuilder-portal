import { deLocalizeUrl } from '$lib/paraglide/runtime';
import type { Reroute, Transport } from '@sveltejs/kit';

export const reroute: Reroute = (request) => {
  return deLocalizeUrl(request.url).pathname;
};

export const transport: Transport = {};

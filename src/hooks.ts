import type { Reroute, Transport } from '@sveltejs/kit';
import { deLocalizeUrl as defaultDeLocalizeUrl } from '$lib/paraglide/runtime';
import { deLocalizeUrl as UDMDeLocalizeUrl } from '$lib/udm/paraglide/runtime';

export const reroute: Reroute = (request) => {
  const isUDM = !!request.url.href.match('/user-data');
  return (isUDM ? UDMDeLocalizeUrl : defaultDeLocalizeUrl)(request.url).pathname;
};

export const transport: Transport = {};

import * as v from 'valibot';
import { requireHTTPRegex, requiredString } from '$lib/valibot';

/**
 * Valibot entries shared by the support-data create and edit forms.
 * The ticket URL is optional (the TicketUrl column is nullable), but when it is
 * given it must be http(s), because it is rendered as a link and a
 * `javascript:` URL would run script for whoever clicks it.
 */
export const supportDataFields = {
  name: requiredString,
  description: v.pipe(v.string(), v.trim()),
  ticketUrl: v.pipe(
    v.string(),
    v.trim(),
    v.union([v.literal(''), v.pipe(v.string(), v.url(), v.regex(requireHTTPRegex))])
  )
};

import * as v from 'valibot';
import { requiredString } from '$lib/valibot';

export const SUPPORT_DATA_NAME_MAX = 200;
export const SUPPORT_DATA_DESCRIPTION_MAX = 5000;

/** a name must contain at least one non-whitespace character */
export const notBlankRegex = /.*\S.*/;
/** a ticket URL must be http(s); also used as the input's native `pattern` so the browser agrees with the server */
export const ticketUrlRegex = /^https?:\/\/\S+$/;

/**
 * Valibot entries shared by the support-data create and edit forms.
 * The ticket URL is optional (the TicketUrl column is nullable), but when it is
 * given it must be http(s), because it is rendered as a link and a
 * `javascript:` URL would run script for whoever clicks it.
 */
export const supportDataFields = {
  name: v.pipe(requiredString, v.maxLength(SUPPORT_DATA_NAME_MAX)),
  description: v.pipe(v.string(), v.trim(), v.maxLength(SUPPORT_DATA_DESCRIPTION_MAX)),
  ticketUrl: v.pipe(
    v.string(),
    v.trim(),
    v.union([v.literal(''), v.pipe(v.string(), v.url(), v.regex(ticketUrlRegex))])
  )
};

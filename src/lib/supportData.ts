export const SUPPORT_DATA_NAME_MAX = 200;
export const SUPPORT_DATA_DESCRIPTION_MAX = 5000;

/**
 * Server-side checks shared by the support-data create and edit actions.
 * Returns an error message, or null if the fields are valid.
 * The ticket URL must be http(s), because it is rendered as a link and a
 * `javascript:` URL would run script for whoever clicks it.
 */
export function validateSupportDataFields(fields: {
  name: string;
  description: string;
  ticketUrl: string;
}): string | null {
  const { name, description, ticketUrl } = fields;

  if (!name) return 'Name is required.';
  if (name.length > SUPPORT_DATA_NAME_MAX) {
    return `Name must be ${SUPPORT_DATA_NAME_MAX} characters or fewer.`;
  }
  if (description.length > SUPPORT_DATA_DESCRIPTION_MAX) {
    return `Description must be ${SUPPORT_DATA_DESCRIPTION_MAX} characters or fewer.`;
  }
  if (!ticketUrl) return 'Ticket URL is required.';

  let url: URL;
  try {
    url = new URL(ticketUrl);
  } catch {
    return 'Enter a valid ticket URL.';
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return 'Ticket URL must use HTTP or HTTPS.';
  }

  return null;
}

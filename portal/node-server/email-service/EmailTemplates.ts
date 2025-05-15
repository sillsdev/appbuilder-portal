import { readFileSync } from 'fs';
import path from 'path';

export const EmailLayoutTemplate = readFileSync(
  path.join(import.meta.dirname, 'templates', 'Layout.html'),
  'utf8'
);
export const ScriptoriaLogoBase64 = readFileSync(
  path.join(import.meta.dirname, 'templates', 'scriptoria-logo.png'),
  'base64'
);
export const NotificationTemplate = readFileSync(
  path.join(import.meta.dirname, 'templates', 'Notification.html'),
  'utf8'
);
export const NotificationWithLinkTemplate = readFileSync(
  path.join(import.meta.dirname, 'templates', 'NotificationWithLink.html'),
  'utf8'
);
export const OrganizationInviteRequestTemplate = readFileSync(
  path.join(import.meta.dirname, 'templates', 'OrganizationInviteRequest.html'),
  'utf8'
);
export const OrganizationMembershipInviteTemplate = readFileSync(
  path.join(import.meta.dirname, 'templates', 'OrganizationMembershipInvite.html'),
  'utf8'
);
export const ProjectImportTemplate = readFileSync(
  path.join(import.meta.dirname, 'templates', 'ProjectImport.html'),
  'utf8'
);
export const ReviewProductTemplate = readFileSync(
  path.join(import.meta.dirname, 'templates', 'ReviewProduct.html'),
  'utf8'
);
export function addProperties(
  template: string,
  properties: Record<string, string>,
  allowMissing = false
): string {
  const ret = Object.entries(properties).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value),
    template
  );
  if (ret.includes('{{') && !allowMissing) {
    throw new Error('Missing properties in email template');
  }
  return ret;
}

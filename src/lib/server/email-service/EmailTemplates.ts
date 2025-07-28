import EmailLayoutTemplate from './templates/Layout.html?raw';
import NotificationTemplate from './templates/Notification.html?raw';
import NotificationWithLinkTemplate from './templates/NotificationWithLink.html?raw';
import OrganizationInviteRequestTemplate from './templates/OrganizationInviteRequest.html?raw';
import OrganizationMembershipInviteTemplate from './templates/OrganizationMembershipInvite.html?raw';
import ProjectImportTemplate from './templates/ProjectImport.html?raw';
import ReviewProductTemplate from './templates/ReviewProduct.html?raw';
import ScriptoriaLogoBase64 from './templates/scriptoria-logo-128w.png?raw';

export {
  EmailLayoutTemplate,
  NotificationTemplate,
  NotificationWithLinkTemplate,
  OrganizationInviteRequestTemplate,
  OrganizationMembershipInviteTemplate,
  ProjectImportTemplate,
  ReviewProductTemplate,
  ScriptoriaLogoBase64
};

export function addProperties(
  template: string,
  properties: Record<string, string | null>,
  allowMissing = false
): string {
  const ret = Object.entries(properties).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), value ?? 'null'),
    template
  );
  if (ret.includes('{{') && !allowMissing) {
    throw new Error('Missing properties in email template');
  }
  return ret;
}

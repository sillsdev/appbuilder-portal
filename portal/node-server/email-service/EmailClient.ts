import { prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import SparkPost from 'sparkpost';
import {
  addProperties,
  EmailLayoutTemplate,
  NotificationTemplate,
  NotificationWithLinkTemplate
} from './EmailTemplates.js';

if (!process.env.VITE_SPARKPOST_API_KEY) {
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore This is necessary for sveltekit, where import.meta.env will in fact exist
  process.env.VITE_SPARKPOST_API_KEY = import.meta.env.VITE_SPARKPOST_API_KEY;
  // @ts-ignore This is necessary for sveltekit, where import.meta.env will in fact exist
  process.env.VITE_SPARKPOST_EMAIL = import.meta.env.VITE_SPARKPOST_EMAIL;
  /* eslint-enable @typescript-eslint/ban-ts-comment */
}
if (!process.env.VITE_SPARKPOST_API_KEY) {
  console.error('SparkPost API key not set. Emails will not be sent.');
}

const sp = new SparkPost(process.env.VITE_SPARKPOST_API_KEY);
export async function sendEmail(
  to: { email: string; name: string }[],
  subject: string,
  body: string
) {
  const template = addProperties(
    EmailLayoutTemplate,
    {
      // If the subject isn't fairly short, including it is ugly
      INSERT_SUBJECT: subject.length > 50 && body.length > 100 ? '' : subject,
      INSERT_CONTENT: body
    },
    true
  );
  return sendEmailInternal(to, subject, template);
}

export async function sendEmailInternal(
  to: { email: string; name: string }[],
  subject: string,
  body: string
) {
  return {
    sparkpostData: await sp.transmissions.send({
      options: {
        transactional: true,
        click_tracking: false,
        open_tracking: false
      },
      content: {
        from: {
          email: process.env.VITE_SPARKPOST_EMAIL,
          name: 'Scriptoria' + (process.env.NODE_ENV === 'development' ? ' (dev)' : '')
        },
        subject,
        html: body
      },
      recipients: to.map((email) => ({ address: email }))
    }),
    to: to.map((email) => email.email)
  };
}

export async function notifySuperAdmins(subject: string, message: string): Promise<unknown>;
export async function notifySuperAdmins(
  subject: string,
  message: string,
  link: string,
  linkText: string
): Promise<unknown>;
export async function notifySuperAdmins(
  subject: string,
  message: string,
  link?: string,
  linkText?: string
): Promise<unknown> {
  const superAdmins = await prisma.users.findMany({
    where: {
      UserRoles: {
        some: {
          RoleId: RoleId.SuperAdmin
        }
      }
    }
  });
  return {
    email: await sendEmail(
      superAdmins.map((admin) => ({ email: admin.Email, name: admin.Name })),
      subject,
      link
        ? addProperties(NotificationWithLinkTemplate, {
            Message: message,
            LinkUrl: link,
            UrlText: linkText
          })
        : addProperties(NotificationTemplate, {
            Message: message
          })
    )
  };
}

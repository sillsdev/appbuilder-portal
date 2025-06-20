import { prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
import {
  addProperties,
  EmailLayoutTemplate,
  NotificationTemplate,
  NotificationWithLinkTemplate
} from './EmailTemplates.js';
import { AmazonSESProvider } from './providers/AmazonSESProvider.js';
import { EmailProvider } from './providers/EmailProvider.js';
import { LogProvider } from './providers/LogProvider.js';
import { SparkpostProvider } from './providers/SparkpostProvider.js';

let emailProvider: EmailProvider = new LogProvider();

if (process.env.VITE_MAIL_SENDER === 'SparkPost') {
  emailProvider = new SparkpostProvider(process.env.VITE_SPARKPOST_API_KEY);
} else if (process.env.VITE_MAIL_SENDER === 'AmazonSES') {
  emailProvider = new AmazonSESProvider();
} else if (process.env.VITE_MAIL_SENDER !== 'LogEmail') {
  console.warn(
    `Unknown MAIL_SENDER: ${process.env.VITE_MAIL_SENDER}. Emails will be logged instead of sent.`
  );
}

export async function sendEmail(
  to: { email: string; name: string }[],
  subject: string,
  body: string
) {
  console.log('Sending email');
  const template = addProperties(
    EmailLayoutTemplate,
    {
      // If the subject isn't fairly short, including it is ugly
      INSERT_SUBJECT: subject.length > 70 && body.length > 100 ? '' : subject,
      INSERT_CONTENT: body
    },
    true
  );
  return emailProvider.sendEmail(to, subject, template);
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

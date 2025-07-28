import { DatabaseReads } from '../database';
import {
  EmailLayoutTemplate,
  NotificationTemplate,
  NotificationWithLinkTemplate,
  addProperties
} from './EmailTemplates';
import type { EmailProvider } from './providers/EmailProvider';
import { LogProvider } from './providers/LogProvider';
import { RoleId } from '$lib/prisma';

let emailProvider: EmailProvider = new LogProvider();

if (process.env.MAIL_SENDER === 'SparkPost') {
  const { SparkpostProvider } = await import('./providers/SparkpostProvider.js');
  if (!process.env.SPARKPOST_API_KEY) {
    throw new Error('SPARKPOST_API_KEY must be set to use SparkPost for email sending.');
  }
  emailProvider = new SparkpostProvider(process.env.SPARKPOST_API_KEY);
} else if (process.env.MAIL_SENDER === 'AmazonSES') {
  const { AmazonSESProvider } = await import('./providers/AmazonSESProvider.js');
  if (!process.env.AWS_EMAIL_ACCESS_KEY_ID || !process.env.AWS_EMAIL_SECRET_ACCESS_KEY) {
    throw new Error(
      'AWS_EMAIL_ACCESS_KEY_ID and AWS_EMAIL_SECRET_ACCESS_KEY must be set to use Amazon SES for email sending.'
    );
  }
  emailProvider = new AmazonSESProvider();
} else if (process.env.MAIL_SENDER !== 'LogEmail') {
  console.warn(
    `Unknown MAIL_SENDER: ${process.env.MAIL_SENDER}. Emails will be logged instead of sent.`
  );
}

export async function sendEmail(
  to: { email: string; name: string }[],
  subject: string,
  body: string
) {
  const template =
    emailProvider instanceof LogProvider
      ? body
      : addProperties(
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
  const superAdmins = await DatabaseReads.users.findMany({
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
      superAdmins.map((admin) => ({ email: admin.Email!, name: admin.Name! })),
      subject,
      link
        ? addProperties(NotificationWithLinkTemplate, {
            Message: message,
            LinkUrl: link,
            UrlText: linkText!
          })
        : addProperties(NotificationTemplate, {
            Message: message
          })
    )
  };
}

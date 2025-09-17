import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { type Transporter, createTransport } from 'nodemailer';
import { DatabaseReads } from '../database';
import {
  EmailLayoutTemplate,
  NotificationTemplate,
  NotificationWithLinkTemplate,
  ScriptoriaLogoBuffer,
  addProperties
} from './EmailTemplates';
import { building } from '$app/environment';
import { RoleId } from '$lib/prisma';

const EMAIL_NAME =
  process.env.ADMIN_NAME ??
  'Scriptoria' + (process.env.NODE_ENV === 'development' ? ' Staging' : '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '<no-email>';
let transporter: Transporter | null = null;
if (!building) {
  if (process.env.MAIL_SENDER === 'AmazonSES') {
    const creds =
      process.env.AWS_EMAIL_ACCESS_KEY_ID && process.env.AWS_EMAIL_SECRET_ACCESS_KEY
        ? {
            credentials: {
              accessKeyId: process.env.AWS_EMAIL_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_EMAIL_SECRET_ACCESS_KEY
            }
          }
        : {};
    const sesClient = new SESv2Client({
      region: process.env.AWS_REGION || 'us-east-1',
      ...creds
    });
    transporter = createTransport({
      SES: { sesClient, SendEmailCommand }
    });
  } else if (process.env.MAIL_SENDER !== 'LogEmail') {
    console.log('Invalid MAIL_SENDER, defaulting to LogEmail');
  }
}

export async function sendEmail(
  to: { email: string; name: string }[],
  subject: string,
  body: string
) {
  if (process.env.MAIL_SENDER === 'AmazonSES') {
    return await transporter?.sendMail({
      from: `"${EMAIL_NAME}" <${ADMIN_EMAIL}>`,
      to: to.map((email) => ({ name: email.name, address: email.email })),
      subject,
      html: addProperties(
        EmailLayoutTemplate,
        {
          // If the subject isn't fairly short, including it is ugly
          INSERT_SUBJECT: subject.length > 70 && body.length > 100 ? '' : subject,
          INSERT_CONTENT: body
        },
        true
      ),
      attachments: [
        {
          filename: 'logo.png',
          content: ScriptoriaLogoBuffer,
          cid: 'logo' // same cid value as in the html img src
        }
      ]
    });
  } else {
    console.log('====================== EMAIL ======================');
    console.log(`From: ${ADMIN_EMAIL}`);
    console.log(`To: ${to.map((email) => `${email.email} (${email.name})`).join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:`);
    console.log(body);
    console.log('---------------------- EMAIL ----------------------');
    return true;
  }
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

import aws from '@aws-sdk/client-ses';
import { EmailProvider } from './EmailProvider.js';

export class AmazonSESProvider extends EmailProvider {
  private ses: aws.SES;

  constructor() {
    // TODO: AWS credentials and region
    super();
    this.ses = new aws.SES({
      apiVersion: '2010-12-01',
      credentials: {
        accessKeyId: process.env.AWS_EMAIL_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_EMAIL_SECRET_ACCESS_KEY || ''
      },
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }
  async sendEmail(
    to: { email: string; name: string }[],
    subject: string,
    body: string
  ): Promise<unknown> {
    return await this.ses.sendEmail({
      Source: `${AmazonSESProvider.EMAIL_NAME} <${AmazonSESProvider.EMAIL_FROM}>`,
      Destination: {
        ToAddresses: to.map((email) => safeAsciiString(`${email.name} <${email.email}>`))
      },
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Html: {
            Data: body
          }
        }
      }
    });
  }
}

function safeAsciiString(str: string): string {
  // 0x20 to 0x7E are printable ASCII characters
  return str.replace(/[^\x20-\x7E]/g, '');
}

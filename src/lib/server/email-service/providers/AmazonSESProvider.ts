import { type SES as SESType, SendEmailCommand } from '@aws-sdk/client-ses';
import { trace } from '@opentelemetry/api';
import { EmailProvider } from './EmailProvider';
const { SES } = await import('@aws-sdk/client-ses');

export class AmazonSESProvider extends EmailProvider {
  private ses: SESType;

  constructor() {
    super();
    this.ses = new SES({
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
    const command = new SendEmailCommand({
      Source: `${AmazonSESProvider.EMAIL_NAME} <${AmazonSESProvider.ADMIN_EMAIL}>`,
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
    try {
      return await this.ses.send(command);
    } catch (error) {
      console.error('Error sending email via Amazon SES:', error);
      trace.getActiveSpan()?.recordException(error as Error);
      throw error;
    }
  }
}

function safeAsciiString(str: string): string {
  // 0x20 to 0x7E are printable ASCII characters
  return str.replace(/[^\x20-\x7E]/g, '');
}

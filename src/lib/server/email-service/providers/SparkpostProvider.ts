import SparkPost from 'sparkpost';
import { ScriptoriaLogoBase64 } from '../EmailTemplates';
import { EmailProvider } from './EmailProvider';

export class SparkpostProvider extends EmailProvider {
  private sp: SparkPost;

  /**
   * Creates an instance of SparkpostProvider.
   * @param {string} [apiKey] - The API key for SparkPost. If not provided, it will use the environment variable.
   * @param {string} [emailFrom] - The email address to use as the sender. If not provided, it will use the environment variable.
   */
  constructor(apiKey?: string) {
    super();
    this.sp = new SparkPost(apiKey || process.env.SPARKPOST_API_KEY);
  }

  async sendEmail(
    to: { email: string; name: string }[],
    subject: string,
    body: string
  ): Promise<unknown> {
    return await this.sp.transmissions.send({
      options: {
        transactional: true,
        click_tracking: false,
        open_tracking: false
      },
      content: {
        from: {
          email: SparkpostProvider.EMAIL_FROM,
          name: SparkpostProvider.EMAIL_NAME
        },
        subject,
        html: body,
        inline_images: [
          {
            name: 'logo',
            type: 'image/png',
            data: ScriptoriaLogoBase64
          }
        ]
      },
      recipients: to.map((email) => ({ address: email }))
    });
  }
}

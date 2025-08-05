import { EmailProvider } from './EmailProvider';

export class LogProvider extends EmailProvider {
  async sendEmail(
    to: { email: string; name: string }[],
    subject: string,
    body: string
  ): Promise<unknown> {
    console.log('====================== EMAIL ======================');
    console.log(`From: ${LogProvider.ADMIN_EMAIL}`);
    console.log(`To: ${to.map((email) => `${email.email} (${email.name})`).join(', ')}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:`);
    console.log(body);
    console.log('---------------------- EMAIL ----------------------');

    return Promise.resolve();
  }
}

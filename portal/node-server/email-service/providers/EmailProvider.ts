export abstract class EmailProvider {
  static readonly EMAIL_NAME =
    'Scriptoria' + (process.env.NODE_ENV === 'development' ? ' (dev)' : '');
  static readonly EMAIL_FROM = process.env.VITE_SPARKPOST_EMAIL;

  abstract sendEmail(
    to: { email: string; name: string }[],
    subject: string,
    body: string
  ): Promise<unknown>;
}

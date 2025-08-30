export abstract class EmailProvider {
  static readonly EMAIL_NAME =
    process.env.ADMIN_NAME ??
    'Scriptoria' + (process.env.NODE_ENV === 'development' ? ' (dev)' : '');
  static readonly ADMIN_EMAIL = process.env.ADMIN_EMAIL || '<no-email>';

  abstract sendEmail(
    to: { email: string; name: string }[],
    subject: string,
    body: string
  ): Promise<unknown>;
}

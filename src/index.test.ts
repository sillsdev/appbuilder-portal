import { describe, expect, it } from 'vitest';
import { sendEmail } from '$lib/server/email-service/EmailClient';

describe('sum test', () => {
  it('adds 1 + 2 to equal 3', () => {
    expect(1 + 2).toBe(3);
  });
});

describe('email test', () => {
  it('send test email', async () => {
    expect(
      await sendEmail(
        [{ email: 'success@simulator.amazonses.com', name: 'SES Simulator' }],
        'Test Email',
        'This is a test email.'
      )
    ).toBeTruthy();
  });
});

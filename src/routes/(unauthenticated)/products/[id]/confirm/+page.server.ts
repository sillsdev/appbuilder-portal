import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

// Mock types for your DB and Email providers
import { DatabaseReads } from '$lib/server/database';
import { DatabaseWrites } from '$lib/server/database';
import { sendEmail } from '$lib/server/email-service/EmailClient';
import { EmailLayoutTemplate, addProperties } from '$lib/server/email-service/EmailTemplates';
// import { sendEmail } from '$lib/server/email';

export const actions: Actions = {
  sendCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    const data = await request.formData();
    const email = data.get('email');

    if (typeof email !== 'string' || !email) {
      return fail(400, { email, missing: true });
    }

    // 1. Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // 2. Save to DB (Upsert pattern)

    await DatabaseWrites.productUserChanges.create({
      data: {
        ProductId: params.id,
        Email: email,
        Change: 'User data deletion request verification',
        DateCreated: new Date(),
        DateUpdated: new Date(),
        ConfirmationCode: code,
        DateExpires: expiresAt,
        DateConfirmed: null
      }
    });

    // 3. Send the email
    const locale = 'en';

    await sendEmail(
      [{ email: email, name: email }],
      'Your verification code',
      addProperties(EmailLayoutTemplate, {
        INSERT_SUBJECT: `Your code is: ${code}`,
        INSERT_CONTENT: `Your code is: ${code}`
      })
    );

    //console.log(`Debug: Code for ${email} is ${code}`);

    return { success: true, email, step: 'verify' as const };
  },

  verifyCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    const data = await request.formData();
    const email = data.get('email');
    const userCode = data.get('code');

    if (typeof email !== 'string' || typeof userCode !== 'string') {
      return fail(400, { error: 'Invalid submission.' });
    }

    // 1. Fetch record from DB
    // const record = await db.emailVerifications.findUnique({ where: { email } });
    const userChange = await DatabaseReads.productUserChanges.findFirst({
      where: {
        Email: email,
        ProductId: params.id
      }
    });

    // 2. Validation Checks
    // Do we have a record?
    if (!userChange) return fail(400, { error: 'No code sent to this email.' });
    // Is the record expired?
    if (new Date() > userChange.DateExpires) return fail(400, { error: 'Code expired.' });

    // 3. Compare
    if (userChange.ConfirmationCode !== userCode) {
      // If wrong code, move expiration up by minute to act as attempt counter
      await DatabaseWrites.productUserChanges.update({
        where: {
          Id: userChange.Id
        },
        data: {
          DateExpires: new Date(userChange.DateExpires.getTime() - 1 * 60 * 1000) // 1 minute
        }
      });
      return fail(400, { error: 'Invalid code.', email, step: 'verify' as const });
    }

    // 4. Success logic
    await DatabaseWrites.productUserChanges.update({
      where: {
        Id: userChange.Id
      },
      data: {
        DateUpdated: new Date(),
        DateConfirmed: new Date()
      }
    });
    // Store user task since verification successful.

    // possibly delete entry?

    throw redirect(303, '/dashboard');
  }
};

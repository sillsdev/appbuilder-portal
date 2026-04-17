import { Prisma } from '@prisma/client';
import { fail } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import prisma from '$lib/server/database/prisma';
import { sendEmail } from '$lib/server/email-service/EmailClient';

const uuidSchema = v.pipe(
  v.string(),
  v.regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    'Invalid product id.'
  )
);

const sendCodeSchema = v.object({
  email: v.pipe(v.string(), v.email('Please enter a valid email address.')),
  productId: uuidSchema
});

const verifyCodeSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  code: v.pipe(v.string(), v.length(6, 'Code must be 6 digits.')),
  productId: uuidSchema
});

export const load: PageServerLoad = async ({ parent, locals }) => {
  locals.security.requireNothing();

  const { productId } = await parent();
  const email = '';

  const sendCodeForm = await superValidate({ email, productId }, valibot(sendCodeSchema));
  const verifyCodeForm = await superValidate(
    { email, code: '', productId },
    valibot(verifyCodeSchema)
  );

  return { email, sendCodeForm, verifyCodeForm, productId };
};

export const actions: Actions = {
  sendCode: async ({ request, locals }) => {
    locals.security.requireNothing();
    const form = await superValidate(request, valibot(sendCodeSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const normalizedEmail = form.data.email.trim().toLowerCase();
    const productId = form.data.productId;

    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    const now = new Date();

    try {
      await prisma.$transaction(
        async (tx) => {
          const existingRequests = await tx.productUserChanges.findMany({
            where: {
              Email: normalizedEmail,
              ProductId: productId,
              DateConfirmed: null
            },
            orderBy: {
              DateCreated: 'desc'
            }
          });

          const [latestRequest, ...staleRequests] = existingRequests;
          if (staleRequests.length > 0) {
            await tx.productUserChanges.updateMany({
              where: {
                Id: {
                  in: staleRequests.map((request) => request.Id)
                }
              },
              data: {
                DateUpdated: now,
                DateExpires: now
              }
            });
          }

          if (latestRequest) {
            await tx.productUserChanges.update({
              where: { Id: latestRequest.Id },
              data: {
                Change: 'User data deletion request verification',
                ConfirmationCode: code,
                DateUpdated: now,
                DateExpires: expiresAt
              }
            });
            return;
          }

          await tx.productUserChanges.create({
            data: {
              ProductId: productId,
              Email: normalizedEmail,
              Change: 'User data deletion request verification',
              DateCreated: now,
              DateUpdated: now,
              ConfirmationCode: code,
              DateExpires: expiresAt,
              DateConfirmed: null
            }
          });
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable
        }
      );

      await sendEmail(
        [{ email: normalizedEmail, name: normalizedEmail }],
        'Your verification code',
        '<p>Your verification code is: <strong>' + code + '</strong></p>'
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[UDM TEST] Verification code for ${normalizedEmail} (product ${productId}): ${code}`
        );
      }

      return message(form, { step: 'verify', email: normalizedEmail });
    } catch {
      return message(form, { error: 'Failed to send code. Please try again.' }, { status: 500 });
    }
  },

  verifyCode: async ({ request, locals }) => {
    locals.security.requireNothing();
    const form = await superValidate(request, valibot(verifyCodeSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const normalizedEmail = form.data.email.trim().toLowerCase();
    const normalizedCode = form.data.code.trim();
    const productId = form.data.productId;

    try {
      const userChange = await DatabaseReads.productUserChanges.findFirst({
        where: {
          Email: normalizedEmail,
          ProductId: productId,
          DateConfirmed: null
        },
        orderBy: {
          DateCreated: 'desc'
        }
      });

      if (!userChange) {
        return message(form, { error: 'No code sent to this email.' }, { status: 400 });
      }
      if (new Date() > userChange.DateExpires) {
        return message(form, { error: 'Code expired.' }, { status: 400 });
      }

      if (userChange.ConfirmationCode !== normalizedCode) {
        await DatabaseWrites.productUserChanges.update({
          where: {
            Id: userChange.Id
          },
          data: {
            DateExpires: new Date(userChange.DateExpires.getTime() - 1 * 60 * 1000)
          }
        });
        return message(form, { error: 'Invalid code.', step: 'verify' }, { status: 400 });
      }

      await DatabaseWrites.productUserChanges.update({
        where: {
          Id: userChange.Id
        },
        data: {
          DateUpdated: new Date(),
          DateConfirmed: new Date()
        }
      });

      return message(form, { verified: true });
    } catch {
      return message(
        form,
        { error: 'Invalid code. Please check your email and try again.' },
        { status: 500 }
      );
    }
  }
};

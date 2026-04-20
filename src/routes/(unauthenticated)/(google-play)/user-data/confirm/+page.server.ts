import { Prisma } from '@prisma/client';
import { fail } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { m } from '$lib/google-play/paraglide/messages';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import prisma from '$lib/server/database/prisma';
import { sendEmail } from '$lib/server/email-service/EmailClient';

const uuidSchema = v.pipe(
  v.string(),
  v.regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    m.udm_error_invalid_product_id()
  )
);

const sendCodeSchema = v.object({
  email: v.pipe(v.string(), v.email(m.udm_alert_valid_email())),
  productId: uuidSchema
});

const verifyCodeSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  code: v.pipe(v.string(), v.length(6, m.udm_error_code_6_digits())),
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
                Change: m.udm_change_description(),
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
              Change: m.udm_change_description(),
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
        m.udm_email_subject(),
        m.udm_email_body({ code })
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[UDM TEST] Verification code for ${normalizedEmail} (product ${productId}): ${code}`
        );
      }

      return message(form, { step: 'verify', email: normalizedEmail });
    } catch {
      return message(form, { error: m.udm_alert_verification_failed() }, { status: 500 });
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
        return message(form, { error: m.udm_error_no_code_sent() }, { status: 400 });
      }
      if (new Date() > userChange.DateExpires) {
        return message(form, { error: m.udm_error_code_expired() }, { status: 400 });
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
        return message(
          form,
          { error: m.udm_error_invalid_code(), step: 'verify' },
          { status: 400 }
        );
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
      return message(form, { error: m.udm_error_invalid_code_retry() }, { status: 500 });
    }
  }
};

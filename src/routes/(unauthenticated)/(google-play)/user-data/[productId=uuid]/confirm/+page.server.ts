import { fail } from '@sveltejs/kit';
import { randomInt } from 'crypto';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { localizedEmailSchema } from '$lib/google-play';
import { m } from '$lib/google-play/paraglide/messages';
import type { Locale } from '$lib/google-play/paraglide/runtime';
import { saveDeleteRequestVerificationCode } from '$lib/google-play/server';
import { RoleId } from '$lib/prisma';
import { BullMQ, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { sendEmail } from '$lib/server/email-service/EmailClient';

const localizedSchemas = (locale: Locale) => ({
  sendCodeSchema: v.object({
    email: localizedEmailSchema(locale)
  }),
  verifyCodeSchema: v.object({
    email: localizedEmailSchema(locale),
    code: v.pipe(v.string(), v.trim(), v.length(6, m.error_code_6_digits({}, { locale })))
  })
});

export const load: PageServerLoad = async ({ parent, locals }) => {
  locals.security.requireNothing();
  const locale = locals.locale as Locale;
  const { sendCodeSchema, verifyCodeSchema } = localizedSchemas(locale);

  const email = '';

  const sendCodeForm = await superValidate({ email }, valibot(sendCodeSchema), { errors: false });
  const verifyCodeForm = await superValidate({ email, code: '' }, valibot(verifyCodeSchema), {
    errors: false
  });

  return { email, sendCodeForm, verifyCodeForm };
};

export const actions: Actions = {
  sendCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    const locale = locals.locale as Locale;
    const { sendCodeSchema } = localizedSchemas(locale);
    const form = await superValidate(request, valibot(sendCodeSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    const code = randomInt(100_000, 1_000_000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    try {
      await saveDeleteRequestVerificationCode({
        productId: params.productId,
        email: form.data.email,
        change: null,
        code,
        expiresAt
      });

      await sendEmail(
        [{ email: form.data.email, name: form.data.email }],
        m.email_subject({}, { locale }),
        m.email_body({ code }, { locale })
      );

      return message(form, { step: 'verify', email: form.data.email });
    } catch {
      return message(form, { error: m.alert_verification_failed({}, { locale }) }, { status: 500 });
    }
  },

  verifyCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    const locale = locals.locale as Locale;
    const { verifyCodeSchema } = localizedSchemas(locale);
    const form = await superValidate(request, valibot(verifyCodeSchema));

    if (!form.valid) {
      return fail(400, { form });
    }

    try {
      const userChange = await DatabaseReads.productUserChanges.findFirst({
        where: {
          Email: form.data.email,
          ProductId: params.productId,
          DateConfirmed: null
        },
        orderBy: {
          DateCreated: 'desc'
        }
      });

      if (!userChange) {
        return message(form, { error: m.error_no_code_sent({}, { locale }) }, { status: 400 });
      }
      if (new Date() > userChange.DateExpires) {
        return message(form, { error: m.error_code_expired({}, { locale }) }, { status: 400 });
      }

      if (userChange.ConfirmationCode !== form.data.code) {
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
          { error: m.error_invalid_code({}, { locale }), step: 'verify' },
          { status: 400 }
        );
      }

      await DatabaseWrites.productUserChanges.update({
        where: {
          Id: userChange.Id
        },
        data: {
          DateConfirmed: new Date()
        }
      });

      await getQueues().UserTasks.add(
        `Update data deletion request task for Product #${params.productId}`,
        {
          type: BullMQ.JobType.UserTasks_DeleteRequest,
          scope: 'Product',
          productId: params.productId,
          requestId: userChange.Id,
          operation: {
            type: BullMQ.UserTasks.OpType.Update,
            targetRole: RoleId.AppBuilder
          }
        }
      );

      return message(form, { verified: true });
    } catch {
      return message(form, { error: m.error_invalid_code_retry({}, { locale }) }, { status: 500 });
    }
  }
};

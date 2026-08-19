import { SpanStatusCode, trace } from '@opentelemetry/api';
import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { localizedEmailSchema } from '$lib/google-play';
import { m } from '$lib/google-play/paraglide/messages';
import type { Locale } from '$lib/google-play/paraglide/runtime';
import { RoleId } from '$lib/prisma';
import { BullMQ, QueueConnected, getQueues } from '$lib/server/bullmq';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';

const tracer = trace.getTracer('UDMRequests');

const localizedSchema = (locale: Locale) =>
  v.object({
    email: localizedEmailSchema(locale),
    code: v.pipe(
      v.string(),
      v.trim(),
      v.digits(m.error_code_6_digits({}, { locale })),
      v.length(6, m.error_code_6_digits({}, { locale }))
    )
  });

export const load: PageServerLoad = async ({ parent, locals }) => {
  locals.security.requireNothing();

  return {
    form: await superValidate(
      { email: '', code: '' },
      valibot(localizedSchema(locals.locale as Locale)),
      {
        errors: false
      }
    )
  };
};

export const actions: Actions = {
  verifyCode: async ({ request, locals, params }) => {
    locals.security.requireNothing();
    return tracer.startActiveSpan('UDM - Verify Code', async (span) => {
      const locale = locals.locale as Locale;
      const form = await superValidate(request, valibot(localizedSchema(locale)));

      if (!form.valid) {
        span.end();
        return fail(400, { form });
      }

      if (!QueueConnected()) {
        span.end();
        return message(form, { error: m.error_appUnavailable({}, { locale }) }, { status: 503 });
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

        void getQueues().UserTasks.add(
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
      } catch (e) {
        span.recordException(e as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (e as Error).message
        });
        return message(
          form,
          { error: m.error_generic({ errorMessage: '' }, { locale }) },
          { status: 500 }
        );
      } finally {
        span.end();
      }
    });
  }
};

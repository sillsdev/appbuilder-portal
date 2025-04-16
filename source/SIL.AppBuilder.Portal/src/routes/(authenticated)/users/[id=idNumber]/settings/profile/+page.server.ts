import { isSuperAdmin } from '$lib/utils/roles';
import { idSchema } from '$lib/valibot';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { where } from '../common.server';
import type { Actions, PageServerLoad } from './$types';

const profileSchema = v.object({
  id: idSchema,
  firstName: v.nullable(v.string()),
  lastName: v.nullable(v.string()),
  displayName: v.nullable(v.string()),
  email: v.nullable(v.pipe(v.string(), v.email())),
  // Legal phone numbers: (123) 456-7890 1234567890 123-4567890 123 456-7890
  phone: v.nullable(v.pipe(v.string(), v.regex(/[\d-() ]+/))),
  timezone: v.nullable(v.string()),
  notifications: v.boolean(),
  visible: v.boolean(),
  active: v.boolean()
});

export const load = (async ({ locals, parent }) => {
  const { subject, canEdit } = await parent();
  const user = (await locals.auth())!.user;
  if (!(user.userId === subject.Id || canEdit)) return error(403);

  const subData = await prisma.users.findUniqueOrThrow({
    where: { Id: subject.Id }
  });
  const form = await superValidate(
    {
      id: subData.Id,
      firstName: subData.GivenName,
      lastName: subData.FamilyName,
      displayName: subData.Name,
      email: subData.Email,
      phone: subData.Phone,
      timezone: subData.Timezone,
      notifications: subData.EmailNotification ?? false,
      visible: !!subData.ProfileVisibility,
      active: !subData.IsLocked
    },
    valibot(profileSchema)
  );
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event, valibot(profileSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    if (form.data.id !== parseInt(event.params.id)) return error(404);

    const user = (await event.locals.auth())!.user;
    if (
      !(
        user.userId === form.data.id ||
        (await prisma.organizations.findFirst({
          where: where(form.data.id, user.userId, isSuperAdmin(user.roles))
        }))
      )
    ) {
      return error(403);
    }

    await DatabaseWrites.users.update({
      where: {
        Id: form.data.id
      },
      data: {
        GivenName: form.data.firstName,
        FamilyName: form.data.lastName,
        Name: form.data.displayName,
        Email: form.data.email,
        Phone: form.data.phone,
        // TODO: sync user data with dwkit
        Timezone: form.data.timezone,
        EmailNotification: form.data.notifications,
        ProfileVisibility: form.data.visible ? 1 : 0,
        // You cannot change lock state of yourself, and if you are editing someone else, you are either org admin or superadmin
        IsLocked: form.data.id === user.userId ? undefined : !form.data.active
      }
    });
    return { form, ok: true };
  }
} satisfies Actions;

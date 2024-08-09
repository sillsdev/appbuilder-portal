import { error } from '@sveltejs/kit';
import { prisma } from 'sil.appbuilder.portal.common';
import { idSchema } from 'sil.appbuilder.portal.common/prisma';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const profileSchema = v.object({
  id: idSchema,
  firstName: v.string(),
  lastName: v.string(),
  displayName: v.string(),
  email: v.pipe(v.string(), v.email()),
  // Legal phone numbers: (123) 456-7890 1234567890 123-4567890 123 456-7890
  phone: v.pipe(v.string(), v.regex(/[\d-() ]+/)),
  timezone: v.string(), // ?
  notifications: v.boolean(),
  visible: v.boolean()
});

export const load = (async ({ params }) => {
  const user = await prisma.users.findUnique({
    where: {
      Id: parseInt(params.id)
    }
  });
  if (!user) return error(404);
  const form = await superValidate(
    {
      id: user.Id,
      firstName: user.GivenName ?? '',
      lastName: user.FamilyName ?? '',
      displayName: user.Name ?? '',
      email: user.Email ?? '',
      phone: user.Phone ?? '',
      timezone: user.Timezone ?? '',
      notifications: user.EmailNotification ?? false,
      visible: !!user.ProfileVisibility
    },
    valibot(profileSchema)
  );
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event, valibot(profileSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    await prisma.users.update({
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
        ProfileVisibility: form.data.visible ? 1 : 0
      }
    });
    return { form, ok: true };
  }
} satisfies Actions;

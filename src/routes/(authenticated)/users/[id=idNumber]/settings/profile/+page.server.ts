import { error } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';
import { DatabaseReads, DatabaseWrites } from '$lib/server/database';
import { phoneRegex } from '$lib/valibot';

const profileSchema = v.object({
  firstName: v.nullable(v.string()),
  lastName: v.nullable(v.string()),
  displayName: v.nullable(v.string()),
  email: v.nullable(v.pipe(v.string(), v.email())),
  phone: v.nullable(v.pipe(v.string(), v.maxLength(24), v.regex(phoneRegex))),
  timezone: v.nullable(v.string()),
  notifications: v.boolean(),
  visible: v.boolean(),
  active: v.boolean()
});

export const load = (async (event) => {
  event.locals.security.requireAuthenticated();
  const user = await DatabaseReads.users.findUnique({
    where: { Id: parseInt(event.params.id) },
    include: { Organizations: { select: { Id: true } } }
  });
  if (!user) return error(404);
  if (event.locals.security.userId !== parseInt(event.params.id)) {
    event.locals.security.requireAdminOfOrgIn(user.Organizations.map((o) => o.Id));
  }
  return {
    form: await superValidate(
      {
        firstName: user.GivenName,
        lastName: user.FamilyName,
        displayName: user.Name,
        email: user.Email,
        phone: user.Phone,
        timezone: user.Timezone,
        notifications: user.EmailNotification ?? false,
        visible: !!user.ProfileVisibility,
        active: !user.IsLocked
      },
      valibot(profileSchema)
    )
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    event.locals.security.requireAuthenticated();
    const user = await DatabaseReads.users.findUnique({
      where: { Id: parseInt(event.params.id) },
      include: { Organizations: { select: { Id: true } } }
    });
    if (!user) return fail(404, { form: null, ok: false });
    if (event.locals.security.userId !== parseInt(event.params.id)) {
      event.locals.security.requireAdminOfOrgIn(user.Organizations.map((o) => o.Id));
    }
    const form = await superValidate(event, valibot(profileSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    await DatabaseWrites.users.update(user.Id, {
      GivenName: form.data.firstName,
      FamilyName: form.data.lastName,
      Name: form.data.displayName,
      Email: form.data.email,
      Phone: form.data.phone,
      Timezone: form.data.timezone,
      EmailNotification: form.data.notifications,
      ProfileVisibility: form.data.visible ? 1 : 0,
      // You cannot change lock state of yourself, and if you are editing someone else, you are either org admin or superadmin
      IsLocked: user.Id === event.locals.security.userId ? undefined : !form.data.active
    });
    return { form, ok: true };
  }
} satisfies Actions;

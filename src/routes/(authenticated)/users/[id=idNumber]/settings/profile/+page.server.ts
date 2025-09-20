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
  phone: v.nullable(v.pipe(v.string(), v.regex(phoneRegex))),
  timezone: v.nullable(v.string()),
  notifications: v.boolean(),
  visible: v.boolean(),
  active: v.boolean()
});

export const load = (async (event) => {
  event.locals.security.requireAuthenticated();
  if (event.locals.security.userId !== parseInt(event.params.id)) {
    event.locals.security.requireAdminOfOrgIn(
      await DatabaseReads.users
        .findUniqueOrThrow({
          where: { Id: parseInt(event.params.id) },
          select: { OrganizationMemberships: { select: { OrganizationId: true } } }
        })
        .then((u) => u.OrganizationMemberships.map((o) => o.OrganizationId))
    );
  }
  const subData = await DatabaseReads.users.findUniqueOrThrow({
    where: { Id: parseInt(event.params.id) }
  });
  return {
    form: await superValidate(
      {
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
    )
  };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    event.locals.security.requireAuthenticated();
    if (event.locals.security.userId !== parseInt(event.params.id)) {
      event.locals.security.requireAdminOfOrgIn(
        await DatabaseReads.users
          .findUniqueOrThrow({
            where: { Id: parseInt(event.params.id) },
            select: { OrganizationMemberships: { select: { OrganizationId: true } } }
          })
          .then((u) => u.OrganizationMemberships.map((o) => o.OrganizationId))
      );
    }
    const form = await superValidate(event, valibot(profileSchema));
    if (!form.valid) return fail(400, { form, ok: false });

    const user = (await event.locals.auth())!.user;
    const subjectId = parseInt(event.params.id);

    await DatabaseWrites.users.update({
      where: {
        Id: subjectId
      },
      data: {
        GivenName: form.data.firstName,
        FamilyName: form.data.lastName,
        Name: form.data.displayName,
        Email: form.data.email,
        Phone: form.data.phone,
        Timezone: form.data.timezone,
        EmailNotification: form.data.notifications,
        ProfileVisibility: form.data.visible ? 1 : 0,
        // You cannot change lock state of yourself, and if you are editing someone else, you are either org admin or superadmin
        IsLocked: subjectId === user.userId ? undefined : !form.data.active
      }
    });
    return { form, ok: true };
  }
} satisfies Actions;

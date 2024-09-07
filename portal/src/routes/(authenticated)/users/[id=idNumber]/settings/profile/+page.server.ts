import { idSchema } from '$lib/valibot';
import type { Session } from '@auth/sveltekit';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
import { RoleId } from 'sil.appbuilder.portal.common/prisma';
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
  visible: v.boolean(),
  active: v.boolean()
});

function verifyAllowed(
  currentUser: Session['user'],
  subjectUserId: number,
  subjectOrganizations: number[]
) {
  // If we are not editing ourselves and we are not an admin who can edit this user, block
  return (
    currentUser.userId === subjectUserId ||
    !!currentUser.roles.find(
      (role) =>
        role[1] === RoleId.SuperAdmin ||
        (subjectOrganizations.includes(role[0]) && role[1] === RoleId.OrgAdmin)
    )
  );
}

export const load = (async ({ params, locals, parent }) => {
  const auth = (await locals.auth())?.user;
  const { organizations } = await parent();
  if (
    !verifyAllowed(
      auth!,
      parseInt(params.id),
      organizations.map((org) => org.Id)
    )
  ) {
    return error(403);
  }
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
      visible: !!user.ProfileVisibility,
      active: !user.IsLocked
    },
    valibot(profileSchema)
  );
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event, valibot(profileSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const auth = await event.locals.auth();
    if (form.data.id !== parseInt(event.params.id)) return fail(400);
    if (
      !verifyAllowed(
        auth!.user,
        form.data.id,
        (
          await prisma.organizationMemberships.findMany({
            where: {
              OrganizationId: {
                in: auth!.user.roles
                  .filter((role) => role[1] === RoleId.OrgAdmin)
                  .map((role) => role[0])
              },
              UserId: form.data.id
            }
          })
        ).map((mem) => mem.OrganizationId)
      )
    ) {
      return fail(403);
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
        IsLocked: form.data.id === auth!.user.userId ? undefined : !form.data.active
      }
    });
    return { form, ok: true };
  }
} satisfies Actions;

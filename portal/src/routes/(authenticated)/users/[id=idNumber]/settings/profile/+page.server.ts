import { isAdminForOrgs } from '$lib/utils/roles';
import { idSchema } from '$lib/valibot';
import type { Session } from '@auth/sveltekit';
import { error } from '@sveltejs/kit';
import { DatabaseWrites, prisma } from 'sil.appbuilder.portal.common';
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
    currentUser.userId === subjectUserId || isAdminForOrgs(subjectOrganizations, currentUser.roles)
  );
}

export const load = (async ({ params, locals, parent }) => {
  const user = (await locals.auth())?.user;
  const subject = await prisma.users.findUnique({
    where: {
      Id: parseInt(params.id)
    },
    include: {
      OrganizationMemberships: true
    }
  });
  if (!subject) return error(404);
  if (
    !verifyAllowed(
      user!,
      parseInt(params.id),
      subject.OrganizationMemberships.map((mem) => mem.OrganizationId)
    )
  ) {
    return error(403);
  }
  const form = await superValidate(
    {
      id: subject.Id,
      firstName: subject.GivenName ?? '',
      lastName: subject.FamilyName ?? '',
      displayName: subject.Name ?? '',
      email: subject.Email ?? '',
      phone: subject.Phone ?? '',
      timezone: subject.Timezone ?? '',
      notifications: subject.EmailNotification ?? false,
      visible: !!subject.ProfileVisibility,
      active: !subject.IsLocked
    },
    valibot(profileSchema)
  );
  return { form };
}) satisfies PageServerLoad;

export const actions = {
  async default(event) {
    const form = await superValidate(event, valibot(profileSchema));
    if (!form.valid) return fail(400, { form, ok: false });
    const user = (await event.locals.auth())!.user;
    if (form.data.id !== parseInt(event.params.id)) return fail(400);
    const subject = await prisma.users.findUnique({
      where: {
        Id: form.data.id
      },
      include: {
        OrganizationMemberships: true
      }
    });
    if (!subject) return error(404);
    if (
      !verifyAllowed(
        user,
        form.data.id,
        subject.OrganizationMemberships.map((mem) => mem.OrganizationId)
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
        IsLocked: form.data.id === user.userId ? undefined : !form.data.active
      }
    });
    return { form, ok: true };
  }
} satisfies Actions;

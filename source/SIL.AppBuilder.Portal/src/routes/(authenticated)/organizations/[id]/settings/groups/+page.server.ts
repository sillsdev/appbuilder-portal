import prisma, { idSchema } from '$lib/server/prisma';
import { redirect } from '@sveltejs/kit';
import { fail, superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const addGroupSchema = v.object({
  id: idSchema,
  name: v.nullable(v.string()),
  abbreviation: v.nullable(v.string())
});
const deleteGroupSchema = v.object({
  id: idSchema
});

export const load = (async (event) => {
  if (isNaN(parseInt(event.params.id))) return redirect(302, '/organizations');
  const organization = await prisma.organizations.findUnique({
    where: {
      Id: parseInt(event.params.id)
    },
    include: {
      Groups: true
    }
  });
  if (!organization) return redirect(302, '/organizations');
  const addForm = await superValidate(valibot(addGroupSchema));
  const deleteForm = await superValidate(valibot(deleteGroupSchema));
  return { organization, addForm, deleteForm };
}) satisfies PageServerLoad;

export const actions = {
  async addGroup(event) {
    const form = await superValidate(event.request, valibot(addGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    try {
      const { id, name, abbreviation } = form.data;
      await prisma.organizations.update({
        where: {
          Id: id
        },
        data: {
          Groups: {
            create: {
              Name: name,
              Abbreviation: abbreviation
            }
          }
        }
      });
      return { form, ok: true };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  },
  async deleteGroup(event) {
    const form = await superValidate(event.request, valibot(deleteGroupSchema));
    if (!form.valid) return fail(400, { form, ok: false, errors: form.errors });
    try {
      const { id } = form.data;
      await prisma.groups.delete({
        where: {
          Id: id
        }
      });
      return { form, ok: true };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;

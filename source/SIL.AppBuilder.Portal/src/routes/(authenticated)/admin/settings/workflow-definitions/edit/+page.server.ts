import { base } from '$app/paths';
import prisma, { idSchema } from '$lib/server/prisma';
import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import type { Actions, PageServerLoad } from './$types';

const editSchema = v.object({
  id: idSchema,
  name: v.nullable(v.string()),
  storeType: idSchema,
  workflowType: idSchema,
  workflowScheme: v.nullable(v.string()),
  workflowBusinessFlow: v.nullable(v.string()),
  description: v.nullable(v.string()),
  properties: v.nullable(v.string()),
  enabled: v.boolean()
});
export const load = (async ({ url }) => {
  const id = parseInt(url.searchParams.get('id') ?? '');
  if (isNaN(id)) {
    return redirect(302, base + '/admin/settings/workflow-definitions');
  }
  const data = await prisma.workflowDefinitions.findFirst({
    where: {
      Id: id
    }
  });
  if (!data) return redirect(302, base + '/admin/settings/workflow-definitions');
  const options = await prisma.storeTypes.findMany();
  const form = await superValidate(
    {
      id: data.Id,
      name: data.Name,
      storeType: data.StoreTypeId!,
      workflowType: data.Type,
      workflowScheme: data.WorkflowScheme,
      workflowBusinessFlow: data.WorkflowBusinessFlow,
      description: data.Description,
      properties: data.Properties,
      enabled: data.Enabled
    },
    valibot(editSchema)
  );
  return { form, options };
}) satisfies PageServerLoad;

export const actions = {
  async edit({ cookies, request }) {
    const form = await superValidate(request, valibot(editSchema));
    if (!form.valid) {
      return fail(400, { form, ok: false, errors: form.errors });
    }
    try {
      const {
        id,
        name,
        description,
        properties,
        enabled,
        storeType,
        workflowBusinessFlow,
        workflowScheme,
        workflowType
      } = form.data;
      await prisma.workflowDefinitions.update({
        where: {
          Id: id
        },
        data: {
          Type: workflowType,
          Name: name,
          WorkflowScheme: workflowScheme,
          WorkflowBusinessFlow: workflowBusinessFlow,
          StoreTypeId: storeType,
          Description: description,
          Properties: properties,
          Enabled: enabled
        }
      });
      return { ok: true, form };
    } catch (e) {
      if (e instanceof v.ValiError) return { form, ok: false, errors: e.issues };
      throw e;
    }
  }
} satisfies Actions;

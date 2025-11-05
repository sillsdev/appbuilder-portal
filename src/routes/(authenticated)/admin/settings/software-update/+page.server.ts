import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getLocale, localizeHref } from '$lib/paraglide/runtime';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import * as v from 'valibot';
import { propertiesSchema } from '$lib/valibot';

const formSchema = v.object({
    comment: v.nullable(v.string())
    // Since we are only getting a comment, I do not believe we need a properties: propertiesSchema here.
})

export const load = (async ({ url, locals }) => {
    locals.security.requireSuperAdmin();
    const id = parseInt(url.searchParams.get('id') ?? '');
    const form = await superValidate(valibot(formSchema));
    if (isNaN(id)) {
        return redirect(302, localizeHref('/admin/settings/software-update'));
    }
    return {form};
}) satisfies PageServerLoad;

export const actions = {
    async start({ cookies, request, locals }){
        locals.security.requireSuperAdmin();
        const form = await superValidate(request, valibot(formSchema));
        if (!form.valid){
            return fail(400, {form, ok: false});
        }
        // TODO: Whatever needs to be done with the post goes here. Need to figure out what this is...
        // The comment value is at form.data.commnet

        return {ok: true, form};
    }
} satisfies Actions
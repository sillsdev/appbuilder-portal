<script lang="ts">
    import type { PageData } from './$types';
    import { superForm } from 'sveltekit-superforms';
    import { toast } from '$lib/utils';
    import { goto } from '$app/navigation';
    import { getLocale, localizeHref } from '$lib/paraglide/runtime';
    import { m } from '$lib/paraglide/messages';
    import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';

    interface Props {
        data: PageData;
    }

    let { data }: Props = $props();
    

    const base = '/admin/settings/software-update';


    
    const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.models_updateSuccess({ name: m.stores_name() }));
      }
    }
    });
    


    let propsOk = $state(true);
</script>

<form class="m-4" method="post" action="?/start" use:enhance>
  <p>{m.admin_nav_software_update_description()}</p>
  <LabeledFormInput key="admin_nav_software_update_comment">
    <input
      type="text"
      name="comment"
      class="input input-bordered w-full validator"
      bind:value={$form.comment}
      required
    />
    <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
  </LabeledFormInput>
  <input type="submit" class="btn btn-primary" value={m.admin_software_update_rebuild_start} disabled={!propsOk}/>
    
</form>
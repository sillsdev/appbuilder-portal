<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/software-update';

  const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.admin_software_update_toast_success());
      }
    }
  });
</script>

<div class="w-full">
  <h1>{m.admin_nav_software_update()}</h1>
  <div class="m-4">
    <p class="pl-4">{m.admin_nav_software_update_description()}</p>
    <br />
    <p class="pl-4">
      <b>{m.admin_software_update_affected_organizations()} {data.organizations}</b>
    </p>
    <br />
    <form class="pl-4" method="post" action="?/start" use:enhance>
      <LabeledFormInput key="admin_nav_software_update_comment">
        <input
          type="text"
          name="comment"
          class="input input-bordered w-full validator"
          bind:value={$form.comment}
          required
        />
        <span class="validator-hint">{m.admin_software_update_comment_required()}</span>
      </LabeledFormInput>
      <input
        type="submit"
        class="btn btn-primary"
        value={m.admin_software_update_rebuild_start()}
      />
    </form>
  </div>
</div>

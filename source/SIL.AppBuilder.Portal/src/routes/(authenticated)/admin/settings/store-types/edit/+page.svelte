<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/store-types';

  const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
      } else {
        // ISSUE: #1107 Add toasts for server-side errors?
        console.warn(form.errors);
      }
    }
  });
</script>

<h3>{m.admin_settings_storeTypes_edit()}</h3>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput name="admin_settings_storeTypes_name">
    <!-- ISSUE: #1107 So this can be null in the database? but S1 UI shows it as required... -->
    <input
      type="text"
      name="name"
      class="input input-bordered w-full validator"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.admin_settings_storeTypes_emptyName()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_storeTypes_description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$form.description}
    ></textarea>
  </LabeledFormInput>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
    <a class="btn" href={localizeHref(base)}>{m.common_cancel()}</a>
  </div>
</form>

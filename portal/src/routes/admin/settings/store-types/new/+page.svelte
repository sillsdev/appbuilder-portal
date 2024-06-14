<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;

  const { form, enhance, message } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/store-types');
      }
    }
  });
</script>

<h3>{$_('models.add', { values: { name: $_('admin.settings.storeTypes.add') } })}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin.settings.storeTypes.name">
    <input type="text" name="name" class="input input-bordered w-full" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.storeTypes.description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/store-types">Cancel</a>
  </div>
</form>

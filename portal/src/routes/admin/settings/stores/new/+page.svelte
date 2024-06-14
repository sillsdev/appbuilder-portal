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
        goto('/admin/settings/stores');
      }
    }
  });
</script>

<h3>{$_('models.add', { values: { name: $_('stores.name') } })}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="stores.attributes.name">
    <input type="text" name="name" class="input input-bordered w-full" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="stores.attributes.description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="storeTypes.name">
    <select class="select select-bordered" name="storeType" bind:value={$form.storeType}>
      {#each data.options.storeType as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/stores">Cancel</a>
  </div>
</form>

<script lang="ts">
  import SuperDebug, { superForm } from 'sveltekit-superforms';
  import { _ } from 'svelte-i18n';
  import type { ActionData, PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';

  export let data: PageData;
  export let form: ActionData;
  const { form: superFormData, enhance } = superForm(data.form);

  $: if (form?.ok) goto('/admin/settings/stores');
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <LabeledFormInput name="stores.attributes.name">
    <input
      class="input w-full input-bordered"
      type="text"
      name="name"
      bind:value={$superFormData.name}
    />
  </LabeledFormInput>
  <LabeledFormInput name="stores.attributes.description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="storeTypes.name">
    <select class="select select-bordered" name="storeType" bind:value={$superFormData.storeType}>
      {#each data.options as option}
        <option value={option.Id}>{option.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/stores">Cancel</a>
  </div>
</form>

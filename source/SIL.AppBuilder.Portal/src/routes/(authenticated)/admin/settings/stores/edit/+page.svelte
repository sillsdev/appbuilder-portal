<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import * as m from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';

  export let data: PageData;
  export let form: ActionData;
  const { form: superFormData, enhance, allErrors } = superForm(data.form);

  $: if (form?.ok) {
    goto('/admin/settings/stores');
    toast('success', m.models_updateSuccess({ name: m.stores_name() }));
  }
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <LabeledFormInput name="stores_attributes_name">
    <input
      class="input w-full input-bordered"
      type="text"
      name="name"
      bind:value={$superFormData.name}
    />
  </LabeledFormInput>
  <LabeledFormInput name="stores_attributes_description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="storeTypes_name">
    <select class="select select-bordered" name="storeType" bind:value={$superFormData.storeType}>
      {#each data.options as option}
        <option value={option.Id}>{option.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  {#if $allErrors.length}
    <ul>
      {#each $allErrors as error}
        <li class="text-red-500">
          <b>{error.path}:</b>
          {error.messages.join('. ')}
        </li>
      {/each}
    </ul>
  {/if}
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/stores">Cancel</a>
  </div>
</form>

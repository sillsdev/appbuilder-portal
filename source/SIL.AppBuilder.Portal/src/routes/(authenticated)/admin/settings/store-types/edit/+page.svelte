<script lang="ts">
  import SuperDebug, { superForm } from 'sveltekit-superforms';
  import * as m from '$lib/paraglide/messages';
  import type { ActionData, PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';

  export let data: PageData;
  export let form: ActionData;
  const { form: superFormData, enhance, allErrors } = superForm(data.form);

  $: if (form?.ok) goto('/admin/settings/store-types');
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <LabeledFormInput name="admin_settings_storeTypes_name">
    <input
      class="input w-full input-bordered"
      type="text"
      name="name"
      bind:value={$superFormData.name}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_storeTypes_description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$superFormData.description}
    />
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
    <a class="btn" href="/admin/settings/store-types">Cancel</a>
  </div>
</form>

<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import * as m from '$lib/paraglide/messages';
  import { toast } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  export let data: PageData;

  const { form, enhance, allErrors } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/stores');
        toast('success', m.models_createSuccess({ name: m.stores_name() }));
      }
    }
  });
</script>

<h3>{m.models_add({ name: m.stores_name() })}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="stores_attributes_name">
    <input type="text" name="name" class="input input-bordered w-full" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="stores_attributes_description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="storeTypes_name">
    <select class="select select-bordered" name="storeType" bind:value={$form.storeType}>
      {#each data.options.storeType as type}
        <option value={type.Id}>{type.Name}</option>
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

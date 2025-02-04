<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { languageTag } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance, allErrors } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/stores');
      }
    }
  });
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput name="stores_attributes_name">
    <input class="input w-full input-bordered" type="text" name="name" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="stores_attributes_description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$form.description}
    ></textarea>
  </LabeledFormInput>
  <LabeledFormInput name="storeTypes_name">
    <select class="select select-bordered" name="storeType" bind:value={$form.storeType}>
      {#each data.options.toSorted((a, b) => byName(a, b, languageTag())) as option}
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

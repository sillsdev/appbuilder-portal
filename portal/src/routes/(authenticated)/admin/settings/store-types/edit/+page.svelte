<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/store-types';

  const { form, enhance, allErrors } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto(localizeHref(base));
      }
    }
  });
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput name="admin_settings_storeTypes_name">
    <input class="input w-full input-bordered" type="text" name="name" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_storeTypes_description">
    <textarea
      name="description"
      class="textarea textarea-bordered w-full"
      bind:value={$form.description}
    ></textarea>
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
    <a class="btn" href={localizeHref(base)}>Cancel</a>
  </div>
</form>

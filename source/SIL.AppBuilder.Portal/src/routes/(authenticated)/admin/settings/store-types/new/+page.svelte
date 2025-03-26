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

  const { form, enhance, allErrors } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto(localizeHref(base));
      }
    }
  });
</script>

<h3>{m.models_add({ name: m.admin_settings_storeTypes_add() })}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin_settings_storeTypes_name">
    <input type="text" name="name" class="input input-bordered w-full" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_storeTypes_description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
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
    <a class="btn" href={localizeHref(base)}>Cancel</a>
  </div>
</form>

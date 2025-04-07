<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/stores';

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

<h3>{m.models_edit({ name: m.stores_name() })}</h3>

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
  <LabeledFormInput name="stores_attributes_description">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <LabeledFormInput name="storeTypes_name">
    <select
      class="select select-bordered validator"
      name="storeType"
      bind:value={$form.storeType}
      required
    >
      {#each data.options.toSorted((a, b) => byName(a, b, getLocale())) as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.admin_settings_stores_emptyStoreType()}</span>
  </LabeledFormInput>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
    <a class="btn" href={localizeHref(base)}>{m.common_cancel()}</a>
  </div>
</form>

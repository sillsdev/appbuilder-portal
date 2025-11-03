<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/stores';

  const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.models_createSuccess({ name: m.stores_name() }));
      }
    }
  });
</script>

<h3 class="pl-4">{m.models_add({ name: m.stores_name() })}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput key="stores_attributes_name">
    <input
      type="text"
      name="name"
      class="input input-bordered validator"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="stores_attributes_description">
    <input
      type="text"
      name="description"
      class="input input-bordered"
      bind:value={$form.description}
    />
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="storeTypes_listTitle">
    <select
      class="select select-bordered validator"
      name="storeType"
      bind:value={$form.storeType}
      required
    >
      {#each data.options.storeType.toSorted((a, b) => byName(a, b, getLocale())) as type}
        <option value={type.Id}>{type.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.stores_emptyStoreType()}</span>
  </LabeledFormInput>
  <div class="my-4">
    <a class="btn btn-secondary" href={localizeHref(base)}>{m.common_cancel()}</a>
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
  </div>
</form>

<style>
  input[type='text'],
  select {
    width: 100%;
  }
  @media (width >= 40rem) {
    input[type='text'],
    select {
      max-width: var(--container-xs);
    }
  }
</style>

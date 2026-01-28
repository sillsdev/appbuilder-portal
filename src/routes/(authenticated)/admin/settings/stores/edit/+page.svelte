<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { StoreType } from '$lib/prisma';
  import { toast } from '$lib/utils';
  import { byString } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/stores';

  const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.models_updateSuccess({ name: m.stores_name() }));
      }
    }
  });
</script>

<h3 class="pl-4">{m.models_edit({ name: m.stores_name() })}</h3>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput key="stores_publisherId">
    <input
      type="text"
      name="publisherId"
      class="input input-bordered validator"
      value={$form.publisherId}
      readonly
    />
    <span class="validator-hint">&nbsp;</span>
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
  {#if $form.storeType === StoreType.GooglePlay}
    <LabeledFormInput key="stores_gpTitle">
      <input
        type="text"
        name="gpTitle"
        class="input input-bordered validator"
        value={$form.gpTitle}
        required
      />
      <span class="validator-hint">{m.stores_gpTitleEmpty()}</span>
    </LabeledFormInput>
  {/if}
  <LabeledFormInput key="project_type">
    <select class="select validator" name="storeType" bind:value={$form.storeType} required>
      {#each data.options.toSorted((a, b) => byString(a.Description, b.Description, getLocale())) as type}
        <option value={type.Id}>{type.Description}</option>
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

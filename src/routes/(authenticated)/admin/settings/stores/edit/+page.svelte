<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { getStoreIcon } from '$lib/icons';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { StoreType } from '$lib/prisma';
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
      value={data.store.BuildEnginePublisherId}
      readonly
      disabled
    />
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="common_type">
    <div class="input input-bordered validator">
      <IconContainer icon={getStoreIcon(data.store.StoreTypeId)} width={20} />
      <input
        type="text"
        name="storeTypeDisplay"
        value={data.store.StoreType.Description}
        readonly
        disabled
      />
    </div>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput key="projectTable_owner">
    <select class="select validator" name="owner" bind:value={$form.owner}>
      <option value={null}>{m.appName()}</option>
      {#each data.organizations.toSorted((a, b) => byName(a, b, getLocale())) as org}
        <option value={org.Id}>{org.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  {#if data.store.StoreTypeId === StoreType.GooglePlay}
    <LabeledFormInput key="stores_gpTitle">
      <input
        type="text"
        name="gpTitle"
        class="input input-bordered validator"
        bind:value={$form.gpTitle}
        required={$form.owner === null}
      />
      <span class="validator-hint">{m.stores_gpTitleEmpty()}</span>
    </LabeledFormInput>
  {/if}
  <LabeledFormInput key="common_description">
    <input
      type="text"
      name="description"
      class="input input-bordered"
      bind:value={$form.description}
    />
    <span class="validator-hint">&nbsp;</span>
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

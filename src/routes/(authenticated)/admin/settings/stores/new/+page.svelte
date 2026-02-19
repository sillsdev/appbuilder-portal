<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SelectWithIcon from '$lib/components/settings/SelectWithIcon.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
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
        toast('success', m.models_createSuccess({ name: m.stores_name() }));
      }
    }
  });
</script>

<h3 class="pl-4">{m.models_add({ name: m.stores_name() })}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput key="projectTable_owner">
    <SelectWithIcon
      bind:value={$form.owner}
      items={data.organizations}
      attr={{ name: 'owner' }}
      icon="clarity:organization-solid"
    >
      {#snippet extra()}
        <option value={null}>{m.appName()}</option>
      {/snippet}
    </SelectWithIcon>
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <LabeledFormInput
    key="stores_publisherId"
    input={{
      name: 'publisherId',
      required: true,
      err: m.stores_publisherIdEmpty(),
      icon: 'material-symbols:publish'
    }}
    bind:value={$form.publisherId}
    class="md:max-w-xs"
  />
  <LabeledFormInput key="common_type">
    <select class="select validator" name="storeType" bind:value={$form.storeType} required>
      {#each data.options.storeType.toSorted( (a, b) => byString(a.Description, b.Description, getLocale()) ) as type}
        <option value={type.Id}>{type.Description}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.stores_emptyStoreType()}</span>
  </LabeledFormInput>
  {#if $form.storeType === StoreType.GooglePlay}
    <LabeledFormInput
      key="stores_gpTitle"
      input={{
        name: 'gpTitle',
        required: $form.owner === null,
        err: m.stores_gpTitleEmpty(),
        icon: 'mdi:google-play'
      }}
      bind:value={$form.gpTitle}
      class="md:max-w-xs"
    />
  {/if}
  <LabeledFormInput
    key="common_description"
    input={{
      name: 'description',
      icon: 'mdi:rename'
    }}
    bind:value={$form.description}
    class="md:max-w-xs"
  />
  <div class="my-4">
    <CancelButton returnTo={localizeHref(base)} />
    <SubmitButton icon="hugeicons:store-add-02" />
  </div>
</form>

<style>
  select {
    width: 100%;
  }
  @media (width >= 40rem) {
    select {
      max-width: var(--container-xs);
    }
  }
</style>

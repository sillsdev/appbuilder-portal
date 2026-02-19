<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SelectWithIcon from '$lib/components/settings/SelectWithIcon.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { StoreType } from '$lib/prisma';
  import { toast } from '$lib/utils';

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
  <LabeledFormInput
    key="stores_publisherId"
    input={{
      name: 'publisherId',
      readonly: true,
      disabled: true,
      icon: 'material-symbols:publish'
    }}
    value={data.store.BuildEnginePublisherId}
    class="md:max-w-xs"
  />
  <LabeledFormInput key="common_type">
    <input
      type="text"
      name="storeTypeDisplay"
      class="input input-bordered validator"
      value={data.store.StoreType.Description}
      readonly
      disabled
    />
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
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
  {#if data.store.StoreTypeId === StoreType.GooglePlay}
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
    <SubmitButton />
  </div>
</form>

<style>
  input[type='text'] {
    width: 100%;
  }
  @media (width >= 40rem) {
    input[type='text'] {
      max-width: var(--container-xs);
    }
  }
</style>

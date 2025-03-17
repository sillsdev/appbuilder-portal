<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import MultiselectBoxElement from '$lib/components/settings/MultiselectBoxElement.svelte';
  import * as m from '$lib/paraglide/messages';
  import { languageTag } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const {
    form: superFormData,
    enhance,
    allErrors
  } = superForm(data.form, {
    dataType: 'json',
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/organizations');
      }
    }
  });

  let getStoreInfo = $derived((store: (typeof $superFormData)['stores'][0]) =>
    data.options.stores.find((s) => s.Id === store.storeId));
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$superFormData.id} />
  <LabeledFormInput name="admin_settings_organizations_name">
    <input
      class="input w-full input-bordered"
      type="text"
      name="name"
      bind:value={$superFormData.name}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_owner">
    <select class="select select-bordered" name="owner" bind:value={$superFormData.owner}>
      {#each data.options.users.toSorted((a, b) => byName(a, b, languageTag())) as option}
        <option value={option.Id}>{option.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_websiteURL">
    <input
      name="websiteURL"
      class="input input-bordered w-full"
      type="text"
      bind:value={$superFormData.websiteURL}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_buildEngineURL">
    <input
      name="buildEngineURL"
      class="input input-bordered w-full"
      type="text"
      bind:value={$superFormData.buildEngineURL}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_accessToken">
    <input
      name="buildEngineAccessToken"
      class="input input-bordered w-full"
      type="text"
      bind:value={$superFormData.buildEngineAccessToken}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_logoURL">
    <input
      name="logoURL"
      class="input input-bordered w-full"
      type="text"
      bind:value={$superFormData.logoURL}
    />
  </LabeledFormInput>
  <div>
    <label>
      <div class="label flex flex-row">
        <div class="flex flex-col">
          <span class="">
            {m.admin_settings_organizations_publicByDefault()}
          </span>
          <span class="text-sm">
            {m.admin_settings_organizations_publicByDefaultDescription()}
          </span>
        </div>
        <input
          name="publicByDefault"
          class="toggle toggle-accent"
          type="checkbox"
          bind:checked={$superFormData.publicByDefault}
        />
      </div>
    </label>
  </div>
  <!-- TODO: sort this. I think this will need a refactor of MultiselectBox -->
  <MultiselectBox header={m.org_storeSelectTitle()}>
    {#each $superFormData.stores as store}
      <MultiselectBoxElement
        bind:checked={store.enabled}
        title={getStoreInfo(store)?.Name ?? ''}
        description={getStoreInfo(store)?.Description ?? ''}
      />
    {/each}
  </MultiselectBox>
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
    <a class="btn" href="/admin/settings/organizations">Cancel</a>
  </div>
</form>

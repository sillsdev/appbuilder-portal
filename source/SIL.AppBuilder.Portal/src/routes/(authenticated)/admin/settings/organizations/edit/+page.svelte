<script lang="ts">
  import SuperDebug, { superForm } from 'sveltekit-superforms';
  import * as m from "$lib/paraglide/messages";
  import type { ActionData, PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';

  export let data: PageData;
  export let form: ActionData;
  const {
    form: superFormData,
    enhance,
    allErrors
  } = superForm(data.form, {
    dataType: 'json'
  });

  $: if (form?.ok) goto('/admin/settings/organizations');
  $: getStoreInfo = (store: (typeof $superFormData)['stores'][0]) =>
    data.options.stores.find((s) => s.Id === store.storeId);
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
      {#each data.options.users as option}
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
          class="toggle toggle-info"
          type="checkbox"
          bind:checked={$superFormData.publicByDefault}
        />
      </div>
    </label>
  </div>

  <!-- <LabeledFormInput name="admin_settings_organizations_publicByDefault" /> -->
  <div class="border border-opacity-15 border-gray-50 rounded-lg p-2">
    <!-- OrganizationStores -->
    <div>
      <span>{m.org_storesTitle()}</span>
      <br />
      <span class="label-text">
        {m.org_storeSelectTitle()}
      </span>
    </div>
    {#each $superFormData.stores as store}
      <div>
        <input type="checkbox" bind:checked={store.enabled} />
        <b>
          {getStoreInfo(store)?.Name}
        </b>
        <br />
        {getStoreInfo(store)?.Description}
      </div>
    {/each}
  </div>
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

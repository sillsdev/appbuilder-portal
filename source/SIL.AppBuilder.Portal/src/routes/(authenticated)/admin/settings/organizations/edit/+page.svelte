<script lang="ts">
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import MultiselectBox from '$lib/components/settings/MultiselectBox.svelte';
  import MultiselectBoxElement from '$lib/components/settings/MultiselectBoxElement.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { byName } from '$lib/utils/sorting';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  const { form, enhance, allErrors } = superForm(data.form, {
    dataType: 'json',
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/organizations');
      }
    }
  });
</script>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput name="admin_settings_organizations_name">
    <input class="input w-full input-bordered" type="text" name="name" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_owner">
    <select class="select select-bordered" name="owner" bind:value={$form.owner}>
      {#each data.options.users.toSorted((a, b) => byName(a, b, getLocale())) as option}
        <option value={option.Id}>{option.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_websiteURL">
    <input
      name="websiteURL"
      class="input input-bordered w-full"
      type="text"
      bind:value={$form.websiteURL}
    />
  </LabeledFormInput>
  <div>
    <label>
      <div class="label flex flex-row">
        <div class="flex flex-col">
          <span class="">
            {m.org_useDefaultBuildEngineTitle()}
          </span>
        </div>
        <input
          name="useDefaultBuildEngine"
          class="toggle toggle-accent"
          type="checkbox"
          bind:checked={$form.useDefaultBuildEngine}
        />
      </div>
    </label>
  </div>
  {#if !$form.useDefaultBuildEngine}
    <LabeledFormInput name="admin_settings_organizations_buildEngineURL">
      <input
        type="text"
        name="buildEngineURL"
        class="input input-bordered w-full"
        bind:value={$form.buildEngineURL}
      />
    </LabeledFormInput>
    <LabeledFormInput name="admin_settings_organizations_accessToken">
      <input
        type="text"
        name="buildEngineAccessToken"
        class="input input-bordered w-full"
        bind:value={$form.buildEngineAccessToken}
      />
    </LabeledFormInput>
  {/if}
  <LabeledFormInput name="admin_settings_organizations_logoURL">
    <input
      name="logoURL"
      class="input input-bordered w-full"
      type="text"
      bind:value={$form.logoURL}
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
          bind:checked={$form.publicByDefault}
        />
      </div>
    </label>
  </div>
  <!-- TODO: sort this. I think this will need a refactor of MultiselectBox -->
  <MultiselectBox header={m.org_storeSelectTitle()}>
    {#each $form.stores as store}
      {@const storeInfo = data.options.stores.find((s) => s.Id === store.storeId)}
      <MultiselectBoxElement
        bind:checked={store.enabled}
        title={storeInfo?.Name ?? ''}
        description={storeInfo?.Description ?? ''}
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

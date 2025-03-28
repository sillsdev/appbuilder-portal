<script lang="ts">
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
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

  const base = '/admin/settings/organizations';

  const { form, enhance, allErrors } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto(localizeHref(base));
      }
    }
  });
</script>

<h3>{m.newOrganization_title()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin_settings_organizations_name">
    <input type="text" name="name" class="input input-bordered w-full" bind:value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_owner">
    <select class="select select-bordered" name="owner" bind:value={$form.owner}>
      {#each data.options.users.toSorted((a, b) => byName(a, b, getLocale())) as user}
        <option value={user.Id}>{user.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_websiteURL">
    <input
      type="text"
      name="websiteURL"
      class="input input-bordered w-full"
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
      type="text"
      name="logoURL"
      class="input input-bordered w-full"
      bind:value={$form.logoURL}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_publicByDefault" className="py-1">
    <InputWithMessage name="admin_settings_organizations_publicByDefaultDescription">
      <input
        name="publicByDefault"
        class="toggle toggle-accent"
        type="checkbox"
        bind:checked={$form.publicByDefault}
      />
    </InputWithMessage>
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

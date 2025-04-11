<script lang="ts">
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/organizations';

  const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.admin_settings_organizations_addSuccess());
      } else {
        // ISSUE: #1107 Add toasts for server-side errors?
        console.warn(form.errors);
      }
    }
  });
</script>

<h3>{m.newOrganization_title()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin_settings_organizations_name">
    <input
      class="input w-full input-bordered validator"
      type="text"
      name="name"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.org_nameError()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_owner">
    <select class="select select-bordered validator" name="owner" bind:value={$form.owner} required>
      {#each data.options.users.toSorted((a, b) => byName(a, b, getLocale())) as user}
        <option value={user.Id}>{user.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.admin_settings_organizations_emptyOwner()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="admin_settings_organizations_websiteURL">
    <input
      type="url"
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
        type="url"
        name="buildEngineUrl"
        class="input input-bordered w-full"
        bind:value={$form.buildEngineUrl}
      />
    </LabeledFormInput>
    <LabeledFormInput name="admin_settings_organizations_accessToken">
      <input
        type="text"
        name="buildEngineApiAccessToken"
        class="input input-bordered w-full"
        bind:value={$form.buildEngineApiAccessToken}
      />
    </LabeledFormInput>
  {/if}
  <LabeledFormInput name="admin_settings_organizations_logoURL">
    <input
      type="url"
      name="logoUrl"
      class="input input-bordered w-full"
      bind:value={$form.logoUrl}
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
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
    <a class="btn" href={localizeHref(base)}>{m.common_cancel()}</a>
  </div>
</form>

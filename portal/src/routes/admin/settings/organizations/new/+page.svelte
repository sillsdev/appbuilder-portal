<script lang="ts">
  import { _ } from 'svelte-i18n';
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { goto } from '$app/navigation';

  export let data: PageData;

  const { form, enhance, message } = superForm(data.form, {
    onUpdated(event) {
      if (event.form.valid) {
        goto('/admin/settings/organizations');
      }
    }
  });
</script>

<h3>{$_('newOrganization.title')}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput name="admin.settings.organizations.name">
    <input type="text" name="name" class="input input-bordered w-full" value={$form.name} />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.organizations.owner">
    <select class="select select-bordered" name="owner">
      {#each data.options.users as user}
        <option value={user.Id}>{user.Name}</option>
      {/each}
    </select>
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.organizations.websiteURL">
    <input
      type="text"
      name="websiteURL"
      class="input input-bordered w-full"
      value={$form.websiteURL}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.organizations.buildEngineURL">
    <input
      type="text"
      name="buildEngineURL"
      class="input input-bordered w-full"
      value={$form.buildEngineURL}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.organizations.accessToken">
    <input
      type="text"
      name="buildEngineAccessToken"
      class="input input-bordered w-full"
      value={$form.buildEngineAccessToken}
    />
  </LabeledFormInput>
  <LabeledFormInput name="admin.settings.organizations.logoURL">
    <input type="text" name="logoURL" class="input input-bordered w-full" value={$form.logoURL} />
  </LabeledFormInput>
  <div>
    <label>
      <div class="label flex flex-row">
        <div class="flex flex-col">
          <span class="">
            {$_('admin.settings.organizations.publicByDefault')}
          </span>
          <span class="text-sm">
            {$_('admin.settings.organizations.publicByDefaultDescription')}
          </span>
        </div>
        <input
          name="publicByDefault"
          class="toggle toggle-info"
          type="checkbox"
          bind:checked={$form.publicByDefault}
        />
      </div>
    </label>
  </div>
  <div class="my-4">
    <input type="submit" class="btn btn-primary" value="Submit" />
    <a class="btn" href="/admin/settings/organizations">Cancel</a>
  </div>
</form>

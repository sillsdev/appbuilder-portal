<script lang="ts">
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import PublicPrivateToggle from '$lib/components/settings/PublicPrivateToggle.svelte';
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
    dataType: 'json',
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.org_editSuccess());
      }
    }
  });
</script>

<h3>{m.org_edit()}</h3>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput name="org_name">
    <input
      class="input w-full input-bordered validator"
      type="text"
      name="name"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.org_nameError()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="org_owner">
    <select class="select select-bordered validator" name="owner" bind:value={$form.owner} required>
      {#each data.users.toSorted((a, b) => byName(a, b, getLocale())) as user}
        <option value={user.Id}>{user.Name}</option>
      {/each}
    </select>
    <span class="validator-hint">{m.org_emptyOwner()}</span>
  </LabeledFormInput>
  <LabeledFormInput name="org_websiteURL">
    <input
      name="websiteUrl"
      class="input input-bordered w-full"
      type="url"
      bind:value={$form.websiteUrl}
    />
  </LabeledFormInput>
  <InputWithMessage title={{ key: 'org_useDefaultBuildEngine' }} className="py-2">
    <input
      name="useDefaultBuildEngine"
      class="toggle toggle-accent"
      type="checkbox"
      bind:checked={$form.useDefaultBuildEngine}
    />
  </InputWithMessage>
  {#if !$form.useDefaultBuildEngine}
    <LabeledFormInput name="org_buildEngineURL">
      <input
        type="url"
        name="buildEngineUrl"
        class="input input-bordered w-full validator"
        bind:value={$form.buildEngineUrl}
        required={!$form.useDefaultBuildEngine}
      />
      <span class="validator-hint">{m.org_emptyBuildEngineURL()}</span>
    </LabeledFormInput>
    <LabeledFormInput name="org_accessToken">
      <input
        type="text"
        name="buildEngineApiAccessToken"
        class="input input-bordered w-full validator"
        bind:value={$form.buildEngineApiAccessToken}
        required={!$form.useDefaultBuildEngine}
      />
      <span class="validator-hint">{m.org_emptyAccessToken()}</span>
    </LabeledFormInput>
  {/if}
  <LabeledFormInput name="org_logoURL">
    <input
      name="logoUrl"
      class="input input-bordered w-full"
      type="url"
      bind:value={$form.logoUrl}
    />
  </LabeledFormInput>
  <PublicPrivateToggle
    title={{ key: 'org_publicByDefault' }}
    message={{ key: 'org_publicByDefaultDescription' }}
    className="py-1"
    formName="publicByDefault"
    bind:checked={$form.publicByDefault}
  />
  <div class="my-4">
    <a class="btn btn-secondary" href={localizeHref(base)}>{m.common_cancel()}</a>
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
  </div>
</form>

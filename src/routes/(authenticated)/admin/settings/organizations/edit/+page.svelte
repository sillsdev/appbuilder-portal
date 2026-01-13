<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';

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

<h3 class="pl-4">{m.org_edit()}</h3>

<!-- <SuperDebug data={superForm} /> -->
<form class="m-4" method="post" action="?/edit" use:enhance>
  <input type="hidden" name="id" value={$form.id} />
  <LabeledFormInput key="org_name">
    <input
      class="input w-full input-bordered validator"
      type="text"
      name="name"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="project_orgContact">
    <input
      name="contact"
      class="input input-bordered w-full validator"
      type="email"
      bind:value={$form.contact}
    />
    <span class="validator-hint">{m.formErrors_emailInvalid()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="org_websiteURL">
    <input
      name="websiteUrl"
      class="input input-bordered w-full validator"
      type="url"
      bind:value={$form.websiteUrl}
    />
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <InputWithMessage title={{ key: 'org_useDefaultBuildEngine' }} class="py-2">
    <input
      name="useDefaultBuildEngine"
      class="toggle toggle-accent"
      type="checkbox"
      bind:checked={$form.useDefaultBuildEngine}
    />
  </InputWithMessage>
  {#if !$form.useDefaultBuildEngine}
    <LabeledFormInput key="org_buildEngineURL">
      <input
        type="url"
        name="buildEngineUrl"
        class="input input-bordered w-full validator"
        bind:value={$form.buildEngineUrl}
        required={!$form.useDefaultBuildEngine}
      />
      <span class="validator-hint">{m.org_emptyBuildEngineURL()}</span>
    </LabeledFormInput>
    <LabeledFormInput key="org_accessToken">
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
  <LabeledFormInput key="org_logoURL">
    <input
      name="logoUrl"
      class="input input-bordered w-full validator"
      type="url"
      bind:value={$form.logoUrl}
    />
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <Toggle
    title={{ key: 'org_publicByDefault' }}
    message={{ key: 'org_publicByDefaultDescription' }}
    class="py-1"
    name="publicByDefault"
    bind:checked={$form.publicByDefault}
    onIcon="mdi:lock-open-variant"
    offIcon="mdi:lock"
  />
  <div class="my-4">
    <a class="btn btn-secondary" href={localizeHref(base)}>{m.common_cancel()}</a>
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
  </div>
</form>

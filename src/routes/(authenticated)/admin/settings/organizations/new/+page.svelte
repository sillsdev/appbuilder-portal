<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = '/admin/settings/organizations';

  const { form, enhance } = superForm(data.form, {
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.org_addSuccess());
      }
    }
  });
</script>

<h3 class="pl-4">{m.newOrganization_title()}</h3>

<form class="m-4" method="post" action="?/new" use:enhance>
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
    <div class="input input-bordered w-full validator">
      <IconContainer icon="ic:baseline-email" width={24} class="cursor-pointer" />
      <input type="email" name="contact" bind:value={$form.contact} />
    </div>
    <span class="validator-hint">{m.formErrors_emailInvalid()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="org_websiteURL">
    <input
      type="url"
      name="websiteUrl"
      class="input input-bordered w-full validator"
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
      type="url"
      name="logoUrl"
      class="input input-bordered w-full validator"
      bind:value={$form.logoUrl}
    />
    <span class="validator-hint">&nbsp;</span>
  </LabeledFormInput>
  <InputWithMessage
    title={{ key: 'org_publicByDefault' }}
    message={{ key: 'org_publicByDefaultDescription' }}
    class="py-1"
  >
    <input
      name="publicByDefault"
      class="toggle toggle-accent"
      type="checkbox"
      bind:checked={$form.publicByDefault}
    />
  </InputWithMessage>
  <div class="my-4">
    <CancelButton returnTo={localizeHref(base)} />
    <SubmitButton icon="material-symbols:add" />
  </div>
</form>

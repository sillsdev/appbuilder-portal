<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
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
  <LabeledFormInput
    key="org_name"
    input={{
      name: 'name',
      err: m.formErrors_nameEmpty(),
      icon: 'mdi:rename',
      required: true
    }}
    bind:value={$form.name}
  />
  <LabeledFormInput
    key="project_orgContact"
    input={{
      type: 'email',
      name: 'contact',
      err: m.formErrors_emailInvalid(),
      icon: 'ic:baseline-email'
    }}
    bind:value={$form.contact}
  />
  <LabeledFormInput
    key="org_websiteURL"
    input={{ type: 'url', name: 'websiteUrl', icon: 'mdi:web' }}
    bind:value={$form.websiteUrl}
  />
  <Toggle
    title={{ key: 'org_useDefaultBuildEngine' }}
    class="py-2"
    name="useDefaultBuildEngine"
    bind:checked={$form.useDefaultBuildEngine}
    onIcon="pepicons-pop:gear"
    offIcon="pepicons-pop:gear-off"
  />
  {#if !$form.useDefaultBuildEngine}
    <LabeledFormInput
      key="org_buildEngineURL"
      input={{
        type: 'url',
        name: 'buildEngineUrl',
        required: !$form.useDefaultBuildEngine,
        err: m.org_emptyBuildEngineURL(),
        icon: 'solar:link-bold'
      }}
      bind:value={$form.buildEngineUrl}
    />
    <LabeledFormInput
      key="org_accessToken"
      input={{
        name: 'buildEngineApiAccessToken',
        required: !$form.useDefaultBuildEngine,
        err: m.org_emptyAccessToken(),
        icon: 'material-symbols:key'
      }}
      bind:value={$form.buildEngineApiAccessToken}
    />
  {/if}
  <LabeledFormInput
    key="org_logoURL"
    input={{
      name: 'logoUrl',
      type: 'url',
      icon: 'material-symbols:image'
    }}
    bind:value={$form.logoUrl}
  />
  <Toggle
    title={{ key: 'org_publicByDefault' }}
    message={{ key: 'org_publicByDefaultDescription' }}
    class="py-1"
    name="publicByDefault"
    bind:checked={$form.publicByDefault}
    onIcon="mdi:eye"
    offIcon="mdi:eye-off-outline"
  />
  <div class="my-4">
    <CancelButton returnTo={localizeHref(base)} />
    <SubmitButton icon="material-symbols:add" />
  </div>
</form>

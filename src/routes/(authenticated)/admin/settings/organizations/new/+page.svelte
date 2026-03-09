<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import { Icons } from '$lib/icons';
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
      icon: Icons.Name,
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
      icon: Icons.Email
    }}
    bind:value={$form.contact}
  />
  <LabeledFormInput
    key="org_websiteURL"
    input={{ type: 'url', name: 'websiteUrl', icon: Icons.Web }}
    bind:value={$form.websiteUrl}
  />
  <Toggle
    title={{ key: 'org_useDefaultBuildEngine' }}
    class="py-2"
    name="useDefaultBuildEngine"
    bind:checked={$form.useDefaultBuildEngine}
    onIcon={Icons.GearOn}
    offIcon={Icons.GearOff}
  />
  {#if !$form.useDefaultBuildEngine}
    <LabeledFormInput
      key="org_buildEngineURL"
      input={{
        type: 'url',
        name: 'buildEngineUrl',
        required: !$form.useDefaultBuildEngine,
        err: m.org_emptyBuildEngineURL(),
        icon: Icons.URL
      }}
      bind:value={$form.buildEngineUrl}
    />
    <LabeledFormInput
      key="org_accessToken"
      input={{
        name: 'buildEngineApiAccessToken',
        required: !$form.useDefaultBuildEngine,
        err: m.org_emptyAccessToken(),
        icon: Icons.Key
      }}
      bind:value={$form.buildEngineApiAccessToken}
    />
  {/if}
  <LabeledFormInput
    key="org_logoURL"
    input={{
      name: 'logoUrl',
      type: 'url',
      icon: Icons.Image
    }}
    bind:value={$form.logoUrl}
  />
  <Toggle
    title={{ key: 'org_publicByDefault' }}
    message={{ key: 'org_publicByDefaultDescription' }}
    class="py-1"
    name="publicByDefault"
    bind:checked={$form.publicByDefault}
    onIcon={Icons.Visible}
    offIcon={Icons.Invisible}
  />
  <div class="my-4">
    <CancelButton returnTo={localizeHref(base)} />
    <SubmitButton icon={Icons.AddGeneric} />
  </div>
</form>

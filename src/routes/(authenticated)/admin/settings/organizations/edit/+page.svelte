<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import { enhance as svk_enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import InputWithMessage from '$lib/components/settings/InputWithMessage.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import Toggle from '$lib/components/settings/Toggle.svelte';
  import GroupUsers from '$lib/organizations/components/GroupUsers.svelte';
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

  let userCount = $state(data.userCount);
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
    <div class="input input-bordered w-full validator">
      <IconContainer icon="ic:baseline-email" width={24} class="cursor-pointer" />
      <input type="email" name="contact" bind:value={$form.contact} />
    </div>
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
    onIcon="mdi:eye"
    offIcon="mdi:eye-off-outline"
  />
  <div class="my-4">
    <a class="btn btn-secondary" href={localizeHref(base)}>{m.common_cancel()}</a>
    <SubmitButton />
  </div>
</form>

<div class="m-4">
  <GroupUsers header={`${m.sidebar_users()}: ${userCount}`} users={data.users}>
    {#snippet user(user)}
      <form
        action="?/toggleUser"
        method="POST"
        use:svk_enhance={({ formElement }) => {
          return async ({ result, update }) => {
            if (result.type === 'success') {
              const res = result.data as ActionData;
              const toggle = formElement.querySelector('[name=enabled]') as HTMLInputElement;
              if (res?.ok) {
                if (toggle.checked) {
                  toast('success', m.user_addedTo({ user: user?.Name ?? '', name: $form.name }));
                  userCount++;
                } else {
                  toast(
                    'success',
                    m.user_removedFrom({ user: user?.Name ?? '', name: $form.name })
                  );
                  userCount--;
                }
              } else {
                if (res?.form.valid) {
                  toast(
                    'error',
                    m.user_ownsProjectsInGroup({
                      user: user?.Name ?? '',
                      group: $form.name
                    })
                  );
                } else {
                  toast('error', m.errors_generic({ errorMessage: '' }));
                }
                // reset toggle
                toggle.checked = !toggle.checked;
              }
            }
            update({ reset: false });
          };
        }}
      >
        <label>
          <span class="flex items-center">
            <input type="hidden" name="userId" value={user.Id} />
            <input type="hidden" name="orgId" value={$form.id} />
            <input
              type="checkbox"
              name="enabled"
              onchange={(e) => {
                e.currentTarget.form?.requestSubmit();
              }}
              class="checkbox checkbox-accent mr-2 mt-2"
              disabled={!!user._count.Projects}
              checked={!!user._count.Organizations}
            />
            <b>
              {user.Name}
            </b>
          </span>
          <p class="ml-8">
            {user.Email}
          </p>
        </label>
      </form>
    {/snippet}
  </GroupUsers>
</div>

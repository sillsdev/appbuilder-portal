<script lang="ts">
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import GroupsSelector from '../GroupsSelector.svelte';
  import RolesSelector from '../RolesSelector.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import OrganizationDropdown from '$lib/components/OrganizationDropdown.svelte';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { orgActive } from '$lib/stores';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    resetForm: false,
    onUpdated(event) {
      if (event.form.valid) {
        goto(localizeHref(redirectUrl));
        toast('success', m.orgMembership_success({ email: event.form.data.email }));
      } else {
        toast('error', m.orgMembership_error());
      }
    },
    onError({ result }) {
      if (result.status === 503) {
        toast('error', m.system_unavailable());
      }
    }
  });

  let currentGroups = $derived(
    data.groupsByOrg.find((o) => o.Id === $form.organizationId)?.Groups ?? []
  );

  onMount(() => {
    if ($orgActive) {
      $form.organizationId = $orgActive;
    }
  });

  const redirectOrg = $derived($form.organizationId ?? $orgActive);

  const redirectUrl = $derived(`/users/org${redirectOrg ? `/${redirectOrg}` : ''}`);
</script>

<div class="w-full max-w-6xl mx-auto">
  <h3>{m.orgMembership_title()}</h3>

  <form class="m-4" method="post" action="?/new" use:enhance>
    <div class="flex flex-row justify-between gap-4 flex-wrap">
      <div class="grow">
        <LabeledFormInput key="orgMembership_email">
          <div class="input input-bordered w-full validator">
            <IconContainer icon="ic:baseline-email" width={24} class="cursor-pointer" />
            <input
              type="email"
              name="email"
              placeholder="user@example.com"
              bind:value={$form.email}
              required
            />
          </div>
          <span class="validator-hint">
            {$form.email ? m.formErrors_emailInvalid() : m.formErrors_emailEmpty()}
          </span>
        </LabeledFormInput>
        <LabeledFormInput key="project_org">
          <OrganizationDropdown
            class="w-full"
            selectProperties={{ name: 'organizationId' }}
            bind:value={$form.organizationId}
            organizations={data.groupsByOrg}
          />
        </LabeledFormInput>
      </div>
      <div class="flex flex-col h-full min-w-96">
        <span class="fieldset-label my-2">
          {m.orgMembership_rolesAndGroups()}
        </span>
        <div class="grow border border-black/20 dark:border-gray-50/20 rounded-lg p-4">
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div>
              <span class="font-bold opacity-75">{m.users_userRoles()}</span>
              <RolesSelector>
                {#snippet selector(role)}
                  <input
                    type="checkbox"
                    class="toggle toggle-accent"
                    value={role}
                    bind:group={$form.roles}
                  />
                {/snippet}
              </RolesSelector>
            </div>
            <div>
              <span class="font-bold opacity-75">{m.users_userGroups()}</span>
              <GroupsSelector groups={currentGroups}>
                {#snippet selector(group)}
                  <input
                    type="checkbox"
                    class="toggle toggle-accent"
                    value={group.Id}
                    bind:group={$form.groups}
                  />
                {/snippet}
              </GroupsSelector>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="my-4 flex justify-end gap-2">
      <CancelButton returnTo={localizeHref(redirectUrl)} />
      <BlockIfJobsUnavailable class="btn btn-primary">
        {#snippet altContent()}
          <IconContainer icon="material-symbols:send" width={20} />
          {m.orgMembership_send()}
        {/snippet}
        <SubmitButton>
          {@render altContent()}
        </SubmitButton>
      </BlockIfJobsUnavailable>
    </div>
  </form>
</div>

<script lang="ts">
  import OrganizationDropdown from '$lib/components/OrganizationDropdown.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import { m } from '$lib/paraglide/messages';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';
  import GroupsSelector from '../GroupsSelector.svelte';
  import RolesSelector from '../RolesSelector.svelte';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  let inputEle: HTMLInputElement;
  const { form, enhance, allErrors } = superForm(data.form, {
    dataType: 'json',
    onUpdated(event) {
      if (event.form.valid) {
        inputEle.classList.add('btn-success');
        inputEle.value = 'Success!';
        inputEle.classList.remove('btn-primary');
        setTimeout(() => {
          window.location.href = '/users';
        }, 2000);
      }
    }
  });

  let currentGroups = $derived(
    data.groupsByOrg.find((o) => o.Id === $form.organizationId)?.Groups ?? []
  );

  onMount(() => {
    $form.organizationId = data.groupsByOrg[0].Id;
  });
</script>

<div class="w-full max-w-6xl mx-auto">
  <h3>{m.organizationMembership_invite_create_inviteUserModalTitle()}</h3>

  <form class="m-4" method="post" action="?/new" use:enhance>
    <div class="flex flex-row justify-between gap-4 flex-wrap">
      <div class="grow">
        <LabeledFormInput name="organizationMembership_invite_create_emailInputPlaceholder">
          <input
            type="email"
            name="email"
            placeholder="user@example.com"
            class="input input-bordered w-full"
            bind:value={$form.email}
          />
        </LabeledFormInput>
        <!-- TODO: Should technically not be this i18n key -->
        <LabeledFormInput name="project_side_organization">
          <OrganizationDropdown
            className="w-full"
            name="organizationId"
            bind:value={$form.organizationId}
            organizations={data.groupsByOrg}
          />
        </LabeledFormInput>
      </div>
      <div class="flex flex-col h-full min-w-96">
        <!-- TODO: i18n -->
        <span class="label-text my-2">Assigned Roles and Groups</span>
        <div class="grow border border-opacity-15 border-gray-50 rounded-lg p-4">
          <div class="flex flex-row space-x-2">
            <div>
              {m.users_userRoles()}
              <RolesSelector bind:roles={$form.roles} />
            </div>
            <div>
              {m.users_userGroups()}
              <GroupsSelector groups={currentGroups} bind:selected={$form.groups} />
            </div>
          </div>
        </div>
      </div>
    </div>

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
    <div class="my-4 flex justify-end gap-2">
      <input
        type="submit"
        class="btn btn-primary"
        value={m.organizationMembership_invite_create_sendInviteButton()}
        bind:this={inputEle}
      />
      <a class="btn" href="/users">{m.common_cancel()}</a>
    </div>
  </form>
</div>

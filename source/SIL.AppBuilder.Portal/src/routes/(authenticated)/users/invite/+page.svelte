<script lang="ts">
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import * as m from '$lib/paraglide/messages';
  import { RoleId } from 'sil.appbuilder.portal.common/prisma';
  import { superForm } from 'sveltekit-superforms';
  import GroupsSelector from '../GroupsSelector.svelte';
  import RolesSelector from '../RolesSelector.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
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
  let selectedOrg = data.organizations[0].Id;
  let rolesField = [
    {
      name: '',
      roles: $form.roles
    }
  ];
  let groupsField = [
    {
      name: '',
      groups: $form.groups,
      id: selectedOrg
    }
  ];
  $: groupsField[0].id = selectedOrg;
  $: $form.organizationId = selectedOrg;
  $: selectedOrg, (groupsField[0].groups = []);
  $: $form.roles = rolesField[0].roles;
  $: $form.groups = groupsField[0].groups;
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
          <select
            class="select select-bordered w-full"
            name="organizationId"
            bind:value={selectedOrg}
          >
            {#each data.organizations.filter( (org) => data.session?.user.roles.find((r) => r[0] === RoleId.SuperAdmin || (r[0] === RoleId.OrgAdmin && r[1] === org.Id)) ) as org}
              <option value={org.Id}>{org.Name}</option>
            {/each}
          </select>
        </LabeledFormInput>
      </div>
      <div class="flex flex-col h-full min-w-96">
        <span class="label-text my-2">Assigned Roles and Groups</span>
        <div class="grow border border-opacity-15 border-gray-50 rounded-lg p-4">
          <div class="flex flex-row space-x-2">
            <div>
              {m.users_userRoles()}
              <RolesSelector bind:organizations={rolesField} />
            </div>
            <div>
              {m.users_userGroups()}
              <GroupsSelector
                bind:organizations={groupsField}
                groups={data.groups.map((g) => ({
                  id: g.Id,
                  name: g.Name ?? '',
                  orgId: g.OwnerId
                }))}
              />
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

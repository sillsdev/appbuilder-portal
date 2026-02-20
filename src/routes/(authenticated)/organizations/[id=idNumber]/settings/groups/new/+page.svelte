<script lang="ts">
  import { type FormResult, superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import { Icons } from '$lib/icons';
  import IconContainer from '$lib/icons/IconContainer.svelte';
  import GroupUsers from '$lib/organizations/components/GroupUsers.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale, localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const { form: groupForm, enhance: groupEnhance } = superForm(data.groupForm, {
    dataType: 'json',
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.org_groupCreated());
      }
    }
  });

  const { form: usersForm, enhance: usersEnhance } = superForm(data.usersForm, {
    dataType: 'json',
    invalidateAll: false,
    onUpdate(event) {
      const returnedData = event.result.data as FormResult<{
        query: { data: { Id: number }[] };
      }>;
      if (event.form.valid && returnedData.query) {
        $groupForm.users = Array.from(
          new Set([...$groupForm.users, ...returnedData.query.data.map(({ Id }) => Id)])
        );
      }
    }
  });

  const base = $derived(`/organizations/${data.organization.Id}/settings/groups`);

  let usersModal: HTMLDialogElement | undefined = $state(undefined);
</script>

<h2>{m.org_addGroupButton()}</h2>

<form class="m-4" method="post" action="?/new" use:groupEnhance>
  <LabeledFormInput
    key="common_name"
    input={{
      name: 'name',
      err: m.formErrors_nameEmpty(),
      icon: Icons.Name,
      required: true
    }}
    bind:value={$groupForm.name}
  />
  <LabeledFormInput key="common_description" class="mb-8">
    <textarea
      name="description"
      class="textarea w-full"
      bind:value={$groupForm.description}
    ></textarea>
  </LabeledFormInput>
  <GroupUsers users={data.users}>
    {#snippet header()}
      {`${m.sidebar_users()}: ${$groupForm.users.length}`}
      {#if data.groups.length}
        <button
          type="button"
          class="ml-2 btn btn-secondary btn-sm"
          onclick={() => usersModal?.showModal()}
        >
          <IconContainer icon={Icons.AddUsers} width={20} />
          {m.org_addUsers()}
        </button>
      {/if}
    {/snippet}
    {#snippet user(user)}
      <label>
        <span class="flex items-center">
          <input
            id="users-{user.Id}"
            type="checkbox"
            onchange={(e) => {
              if (e.currentTarget.checked) {
                $groupForm.users = [...$groupForm.users, user.Id];
              } else {
                $groupForm.users = $groupForm.users.filter((u) => u !== user.Id);
              }
            }}
            class="checkbox checkbox-accent mr-2 mt-2"
            checked={$groupForm.users.includes(user.Id)}
          />
          <b>
            {user.Name}
          </b>
        </span>
        <p class="ml-8">
          {user.Email}
        </p>
      </label>
    {/snippet}
  </GroupUsers>
  <div class="my-4">
    <CancelButton returnTo={localizeHref(base)} />
    <SubmitButton icon={Icons.AddGroup} />
  </div>
</form>

<dialog bind:this={usersModal} class="modal">
  <div class="modal-box">
    <div class="flex flex-row">
      <h2 class="text-lg font-bold grow">
        {m.org_addUsers()}
      </h2>
      <button
        class="btn btn-ghost"
        type="button"
        onclick={() => {
          usersModal?.close();
        }}
      >
        <IconContainer icon={Icons.Close} width={36} class="opacity-80" />
      </button>
    </div>
    <form
      class="flex flex-col gap-2 w-full pt-2 text-left"
      action="?/users"
      method="POST"
      use:usersEnhance
    >
      {#each data.groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
        <label>
          <span class="flex items-center">
            <input
              type="checkbox"
              bind:group={$usersForm.groups}
              class="checkbox checkbox-accent mr-2 mt-2"
              value={group.Id}
            />
            <IconContainer icon={Icons.Group} width={20} />&nbsp;
            <b>
              {group.Name}
            </b>
            : {group._count.Users}
          </span>
        </label>
      {/each}
      <div class="flex flex-row gap-2 mt-2">
        <CancelButton
          onclick={() => {
            usersModal?.close();
          }}
        />
        <SubmitButton
          key="common_add"
          icon={Icons.AddGroup}
          disabled={!$usersForm.groups.length}
          onclick={() => {
            usersModal?.close();
          }}
        />
      </div>
    </form>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>{m.common_close()}</button>
  </form>
</dialog>

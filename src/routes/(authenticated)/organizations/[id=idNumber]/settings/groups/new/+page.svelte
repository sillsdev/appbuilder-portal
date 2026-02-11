<script lang="ts">
  import { type FormResult, superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import GroupUsers from '$lib/organizations/components/GroupUsers.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';

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
  <LabeledFormInput key="common_name">
    <input
      type="text"
      name="name"
      class="input input-bordered w-full validator"
      bind:value={$groupForm.name}
      required
    />
    <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="common_description" class="mb-8">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$groupForm.description}
    />
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
          <IconContainer icon="material-symbols:group-add" width={20} />
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
    <a class="btn btn-secondary" href={localizeHref(base)}>{m.common_cancel()}</a>
    <input type="submit" class="btn btn-primary" value={m.common_save()} />
  </div>
</form>

<dialog bind:this={usersModal} class="modal">
  <div class="modal-box">
    <h2 class="text-lg font-bold grow">
      {m.org_addUsers()}
    </h2>
    <form
      class="flex flex-col gap-2 w-full pt-2 text-left"
      action="?/users"
      method="POST"
      use:usersEnhance
    >
      {#each data.groups as group}
        <label>
          <span class="flex items-center">
            <input
              type="checkbox"
              bind:group={$usersForm.groups}
              class="checkbox checkbox-accent mr-2 mt-2"
              value={group.Id}
            />
            <IconContainer icon="mdi:account-group" width={20} />&nbsp;
            <b>
              {group.Name}
            </b>
            : {group._count.Users}
          </span>
        </label>
      {/each}
      <div class="flex flex-row gap-2 mt-2">
        <button
          class="btn btn-secondary"
          type="button"
          onclick={() => {
            usersModal?.close();
          }}
        >
          {m.common_cancel()}
        </button>
        <input
          class="btn btn-primary"
          type="submit"
          value={m.common_add()}
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

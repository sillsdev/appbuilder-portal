<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import GroupUsers from '$lib/organizations/components/GroupUsers.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.org_groupCreated());
      }
    }
  });

  const base = $derived(`/organizations/${data.organization.Id}/settings/groups`);
</script>

<h2>{m.org_addGroupButton()}</h2>

<form class="m-4" method="post" action="?/new" use:enhance>
  <LabeledFormInput key="common_name">
    <input
      type="text"
      name="name"
      class="input input-bordered w-full validator"
      bind:value={$form.name}
      required
    />
    <span class="validator-hint">{m.formErrors_nameEmpty()}</span>
  </LabeledFormInput>
  <LabeledFormInput key="common_description" class="mb-8">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <GroupUsers header={`${m.sidebar_users()}: ${$form.users.length}`} users={data.users}>
    {#snippet user(user)}
      <label>
        <span class="flex items-center">
          <input
            type="checkbox"
            onchange={(e) => {
              if (e.currentTarget.checked) {
                $form.users = [...$form.users, user.Id];
              } else {
                $form.users = $form.users.filter((u) => u !== user.Id);
              }
            }}
            class="checkbox checkbox-accent mr-2 mt-2"
            checked={$form.users.includes(user.Id)}
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

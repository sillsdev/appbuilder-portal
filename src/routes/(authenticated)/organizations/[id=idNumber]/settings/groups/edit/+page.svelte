<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import type { ActionData, PageData } from './$types';
  import { enhance as svk_enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import CancelButton from '$lib/components/settings/CancelButton.svelte';
  import LabeledFormInput from '$lib/components/settings/LabeledFormInput.svelte';
  import SubmitButton from '$lib/components/settings/SubmitButton.svelte';
  import GroupUsers from '$lib/organizations/components/GroupUsers.svelte';
  import { m } from '$lib/paraglide/messages';
  import { localizeHref } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const base = $derived(`/organizations/${data.organization.Id}/settings/groups`);

  const { form, enhance } = superForm(data.form, {
    dataType: 'json',
    onUpdated({ form }) {
      if (form.valid) {
        goto(localizeHref(base));
        toast('success', m.org_groupEdited());
      }
    }
  });

  let userCount = $state(data.group._count.Users);

  const { form: deleteForm, enhance: deleteEnhance } = superForm(data.deleteForm, {
    invalidateAll: false, // this is important to prevent page reload and 404
    onUpdate({ form: check, result }) {
      const data = result.data as ActionData;
      if (data?.ok) {
        toast('success', m.org_groupDeleted());
        goto(localizeHref(base));
      } else if (check.valid) {
        toast('error', m.org_groupHasProjects({ group: $form.name ?? '' }));
      } else {
        toast('error', m.errors_generic({ errorMessage: '' }));
      }
    }
  });
</script>

<h3 class="pl-4">{m.org_editGroupTitle()}</h3>

<form class="m-4" method="post" action="?/edit" use:enhance>
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
  <LabeledFormInput key="common_description" class="mb-4">
    <input
      type="text"
      name="description"
      class="input input-bordered w-full"
      bind:value={$form.description}
    />
  </LabeledFormInput>
  <div>
    <CancelButton returnTo={localizeHref(base)} />
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
            <input type="hidden" name="groupId" value={data.group.Id} />
            <input
              type="checkbox"
              name="enabled"
              onchange={(e) => {
                e.currentTarget.form?.requestSubmit();
              }}
              class="checkbox checkbox-accent mr-2 mt-2"
              disabled={!!user._count.Projects}
              checked={!!user._count.Groups}
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

{#if !data.group._count.Projects}
  <form class="m-4" method="post" action="?/deleteGroup" use:deleteEnhance>
    <input type="hidden" name="id" value={$deleteForm.id} />
    <SubmitButton class="btn-error! w-full" key="common_delete" icon="mdi:trash" />
  </form>
{/if}

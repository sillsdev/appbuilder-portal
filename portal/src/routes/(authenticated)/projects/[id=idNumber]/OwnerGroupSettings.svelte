<script lang="ts">
  import { enhance } from '$app/forms';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';
  import type { ActionData } from './$types';

  interface Props {
    project: {
      Owner: {
        Id: number;
        Name: string | null;
      };
      Group: {
        Id: number;
        Name: string | null;
      };
    };
    users: {
      Id: number;
      Name: string | null;
    }[];
    groups: {
      Id: number;
      Name: string | null;
    }[];
    orgName: string | null | undefined;
  }

  let { project, users, groups, orgName }: Props = $props();

  let timeout: NodeJS.Timeout;
  let form: HTMLFormElement;
  let ownerField: HTMLInputElement;
  let groupField: HTMLInputElement;
  function submit() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      form.requestSubmit();
    }, 2000);
  }
</script>

<div class="bg-neutral card card-bordered border-slate-400 rounded-md max-w-full">
  <form
    action="?/editOwnerGroup"
    bind:this={form}
    method="post"
    use:enhance={() =>
      ({ update, result }) => {
        if (result.type === 'success') {
          const res = result.data as ActionData;
          if (res?.ok) {
            toast('success', m.updated());
          } else {
            toast('error', m.errors_generic({ errorMessage: '' }));
          }
        }
        update({ reset: false });
      }}
  >
    <div class="flex flex-col py-4">
      <div class="flex flex-col place-content-between px-4">
        <span class="items-center flex gap-x-1">
          <IconContainer icon="clarity:organization-solid" width="20" />
          {m.project_side_organization()}
        </span>
        <span class="text-right">
          {orgName}
        </span>
      </div>
      <div class="divider my-2"></div>
      <div class="flex flex-col place-content-between px-4 pr-2">
        <span>
          <IconContainer icon="mdi:user" width="20" />
          {m.project_side_projectOwner()}
        </span>
        <span class="text-right flex place-content-end dropdown-wrapper">
          <Dropdown
            labelClasses="p-0.5 h-auto min-h-0 no-animation flex-nowrap items-center font-normal"
            contentClasses="drop-arrow arrow-top menu z-20 min-w-[10rem] top-8 right-0"
          >
            {#snippet label()}
              <span class="flex items-center pl-1">
                {project?.Owner.Name}
                <IconContainer icon="gridicons:dropdown" width="20" />
              </span>
            {/snippet}
            {#snippet content()}
              <input type="hidden" name="owner" value={project.Owner.Id} bind:this={ownerField} />
              <ul class="menu menu-compact overflow-hidden rounded-md">
                {#each users.toSorted((a, b) => byName(a, b, getLocale())) as user}
                  <li class="w-full rounded-none">
                    <button
                      class="text-nowrap"
                      class:font-bold={user.Id === project.Owner.Id}
                      onclick={() => {
                        ownerField.value = user.Id + '';
                        submit();
                      }}
                    >
                      {user.Name}
                    </button>
                  </li>
                {/each}
              </ul>
            {/snippet}
          </Dropdown>
        </span>
      </div>
      <div class="divider my-2"></div>
      <div class="flex flex-col place-content-between px-4 pr-2">
        <span class="grow text-nowrap">
          <IconContainer icon="mdi:account-group" width={20} />
          {m.project_side_projectGroup()}
        </span>
        <span class="shrink text-right flex place-content-end items-center dropdown-wrapper">
          <Dropdown
            labelClasses="p-0.5 h-auto min-h-0 no-animation flex-nowrap items-center font-normal"
            contentClasses="drop-arrow arrow-top menu z-20 min-w-[10rem] top-8 right-0"
          >
            {#snippet label()}
              <span class="flex items-center pl-1">
                {project?.Group.Name}
                <IconContainer icon="gridicons:dropdown" width="20" />
              </span>
            {/snippet}
            {#snippet content()}
              <input type="hidden" name="group" value={project.Group.Id} bind:this={groupField} />
              <ul class="menu menu-compact overflow-hidden rounded-md">
                {#each groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
                  <li class="w-full rounded-none">
                    <button
                      class="text-nowrap"
                      class:font-bold={group.Id === project.Group.Id}
                      onclick={() => {
                        groupField.value = group.Id + '';
                        submit();
                      }}
                    >
                      {group.Name}
                    </button>
                  </li>
                {/each}
              </ul>
            {/snippet}
          </Dropdown>
        </span>
      </div>
    </div>
  </form>
</div>

<style>
  .dropdown-wrapper :global(.drop-arrow::after) {
    content: '';
    width: 10px;
    height: 10px;
    transform: rotate(45deg);
    position: absolute;
    bottom: -5px;
    right: 10px;
    background-color: var(--fallback-b2, oklch(var(--b2) / var(--tw-bg-opacity)));
  }
  .dropdown-wrapper :global(.drop-arrow.arrow-top::after) {
    bottom: auto;
    top: -5px;
  }
</style>

<script lang="ts">
  import type { Prisma } from '@prisma/client';
  import type { ActionData } from '../$types';
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import BlockIfJobsUnavailable from '$lib/components/BlockIfJobsUnavailable.svelte';
  import Dropdown from '$lib/components/Dropdown.svelte';
  import IconContainer from '$lib/components/IconContainer.svelte';
  import { m } from '$lib/paraglide/messages';
  import { getLocale } from '$lib/paraglide/runtime';
  import { toast } from '$lib/utils';
  import { byName } from '$lib/utils/sorting';

  interface Props {
    project: Prisma.ProjectsGetPayload<{
      select: {
        Owner: {
          select: {
            Id: true;
            Name: true;
          };
        };
        Group: {
          select: {
            Id: true;
            Name: true;
          };
        };
      };
    }>;
    users: Prisma.UsersGetPayload<{
      select: {
        Id: true;
        Name: true;
      };
    }>[];
    groups: Prisma.GroupsGetPayload<{
      select: {
        Id: true;
        Name: true;
      };
    }>[];
    orgName: string | null | undefined;
    endpoint: string;
    canEdit: boolean;
    canClaim: boolean;
  }

  let { project, users, groups, orgName, endpoint, canEdit, canClaim }: Props = $props();

  let form: HTMLFormElement;
  let ownerField: HTMLInputElement;
  let ownerOpen = $state(false);
  let groupField: HTMLInputElement;
  let groupOpen = $state(false);
</script>

<div class="bg-neutral card border border-slate-400 rounded-md max-w-full">
  <form
    action="?/{endpoint}"
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
        } else if (result.type === 'error') {
          if (result.status === 503) {
            toast('error', m.system_unavailable());
          }
        }
        update({ reset: false });
      }}
  >
    <div class="flex flex-col py-4">
      <div class="flex flex-col place-content-between px-4">
        <span class="items-center flex gap-x-1">
          <IconContainer icon="clarity:organization-solid" width="20" />
          {m.project_org()}
        </span>
        <span class="text-right">
          {orgName}
        </span>
      </div>
      <div class="divider my-2"></div>
      <div class="flex flex-col place-content-between px-4 pr-2">
        <span>
          <IconContainer icon="mdi:user" width="20" />
          {m.project_owner()}
        </span>
        <span class="text-right flex place-content-end dropdown-wrapper">
          <input type="hidden" name="owner" value={project.Owner.Id} bind:this={ownerField} />
          {#if canEdit || canClaim}
            <Dropdown
              class={{
                label: 'p-0.5 h-auto min-h-0 no-animation flex-nowrap items-center font-normal',
                content: 'drop-arrow arrow-top menu z-20 min-w-[10rem] top-8 right-0'
              }}
              bind:open={ownerOpen}
            >
              {#snippet label()}
                <BlockIfJobsUnavailable>
                  {#snippet altContent()}
                    <span class="flex items-center pl-1">
                      {project?.Owner.Name}
                      <IconContainer icon="gridicons:dropdown" width="20" />
                    </span>
                  {/snippet}
                  {@render altContent()}
                </BlockIfJobsUnavailable>
              {/snippet}
              {#snippet content()}
                <ul class="menu menu-compact overflow-hidden rounded-md">
                  {#each users.toSorted((a, b) => byName(a, b, getLocale())) as user}
                    {@const disabled =
                      user.Id !== page.data.session?.user.userId && canClaim && !canEdit}
                    <li class="w-full rounded-none">
                      <button
                        type="button"
                        class="text-nowrap"
                        class:font-bold={user.Id === project.Owner.Id}
                        class:pointer-events-none={disabled || user.Id === project.Owner.Id}
                        class:opacity-70={disabled && user.Id !== project.Owner.Id}
                        onclick={() => {
                          ownerField.value = user.Id + '';
                          form.requestSubmit();
                          ownerOpen = false;
                        }}
                        {disabled}
                      >
                        {user.Name}
                      </button>
                    </li>
                  {/each}
                </ul>
              {/snippet}
            </Dropdown>
          {:else}
            {project.Owner.Name}
          {/if}
        </span>
      </div>
      <div class="divider my-2"></div>
      <div class="flex flex-col place-content-between px-4 pr-2">
        <span class="grow text-nowrap">
          <IconContainer icon="mdi:account-group" width={20} />
          {m.project_group()}
        </span>
        <span class="shrink text-right flex place-content-end items-center dropdown-wrapper">
          <input type="hidden" name="group" value={project.Group.Id} bind:this={groupField} />
          {#if canEdit}
            <Dropdown
              class={{
                label: 'p-0.5 h-auto min-h-0 no-animation flex-nowrap items-center font-normal',
                content: 'drop-arrow arrow-top menu z-20 min-w-[10rem] top-8 right-0'
              }}
              bind:open={groupOpen}
            >
              {#snippet label()}
                <span class="flex items-center pl-1">
                  {project?.Group.Name}
                  <IconContainer icon="gridicons:dropdown" width="20" />
                </span>
              {/snippet}
              {#snippet content()}
                <ul class="menu menu-compact overflow-hidden rounded-md">
                  {#each groups.toSorted((a, b) => byName(a, b, getLocale())) as group}
                    <li class="w-full rounded-none">
                      <button
                        type="button"
                        class="text-nowrap"
                        class:font-bold={group.Id === project.Group.Id}
                        onclick={() => {
                          groupField.value = group.Id + '';
                          form.requestSubmit();
                          groupOpen = false;
                        }}
                      >
                        {group.Name}
                      </button>
                    </li>
                  {/each}
                </ul>
              {/snippet}
            </Dropdown>
          {:else}
            {project.Group.Name}
          {/if}
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
